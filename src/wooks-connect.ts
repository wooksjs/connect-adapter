import { createHttpContext, HttpError, WooksHttp } from '@wooksjs/event-http'
import Connect, { Server as ConnectServer, NextHandleFunction } from 'connect'
import { IncomingMessage, Server, ServerResponse } from 'http'

export class WooksConnect extends WooksHttp {
    constructor(protected connectServer: ConnectServer, protected opts?: { raise404?: boolean }) {
        super()
        connectServer.use(this.getServerCb() as  NextHandleFunction)
    }

    public async listen(...args: Parameters<Server['listen']>) {
        const server = this.server = this.connectServer.listen(...args)
        return new Promise((resolve, reject) => {
            server.once('listening', resolve)
            server.once('error', reject)
        })
    }

    getServerCb() {
        return (async (req: IncomingMessage, res: ServerResponse, next?: Connect.NextFunction) => {
            const { restoreCtx, clearCtx } = createHttpContext({ req, res })
            const handlers = this.wooks.lookup(req.method as string, req.url as string)
            if (handlers) {
                try {
                    await this.processHandlers(handlers)
                } catch (e) {
                    console.error('Internal error, please report: ', e as Error)
                    if ((e as Error).stack) {
                        console.warn((e as Error).stack)
                    }                        
                    restoreCtx()
                    this.respond(e)
                    clearCtx()
                }
            } else {
                // not found
                if (this.opts?.raise404) {
                    this.respond(new HttpError(404))
                    clearCtx()
                } else if (next) {
                    next()
                }
            }    
        })
    }    
}
