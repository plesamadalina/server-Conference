//env
const dotenv = require('dotenv')
const result = dotenv.config()
if (result.error) {
  const path = `.env`
  dotenv.config({ path })
}

if (process.env.NODE_ENV) {
  dotenv.config({ path: `./.env.${process.env.NODE_ENV}`, override: true })
}

const keyPerFileEnv = require('@totalsoft/key-per-file-configuration')
const configMonitor = keyPerFileEnv.load()

require('console-stamp')(global.console, {
  format: ':date(yyyy/mm/dd HH:MM:ss.l)'
})

const { logger } = require('./startup'),
  { createServer } = require('http'),
  { startApolloServer } = require('./servers')

// Metrics, diagnostics
const { DIAGNOSTICS_ENABLED, METRICS_ENABLED } = process.env,
  diagnosticsEnabled = JSON.parse(DIAGNOSTICS_ENABLED),
  metricsEnabled = JSON.parse(METRICS_ENABLED),
  diagnostics = require('./monitoring/diagnostics'),
  metrics = require('./monitoring/metrics')

const httpServer = createServer()
const apolloServerPromise = startApolloServer(httpServer)

const port = process.env.PORT || 4000
httpServer.listen(port, () => {
  logger.info(`🚀 Server ready at http://localhost:${port}/graphql`)
})

async function cleanup() {
  await configMonitor?.close()
  await (await apolloServerPromise)?.stop()
}

const { gracefulShutdown } = require('@totalsoft/graceful-shutdown')
gracefulShutdown({
  onShutdown: cleanup,
  terminationSignals: ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'],
  unrecoverableEvents: ['uncaughtException', 'unhandledRejection'],
  logger,
  timeout: 5000
})

diagnosticsEnabled && diagnostics.startServer(logger)
metricsEnabled && metrics.startServer(logger)
