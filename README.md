# Connect Adapter (Wooks Composables)

**!!! This is work-in-progress library, breaking changes are expected !!!**

<p align="center">
<img src="./docs/wooksjs-connect.png" height="156px"><br>
<a  href="https://github.com/wooksjs/connect-adapter/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</a>
</p>

Want to use [@wooksjs/event-http](https://www.npmjs.com/package/@wooksjs/event-http) but your project is coupled with connect? ✅ This is not a problem with this Connect Adapter for [wooks](https://www.npmjs.com/package/wooks)

## Install

`npm install @wooksjs/connect-adapter @wooksjs/event-http`

## Usage

There are two options to use connect with wooks

### 1. Adapter for connect API:
This one will modify connect `use`, method. Take this one if you want to keep using connect app API.
```ts
import connect from 'connect'
import { applyConnectAdapter } from '@wooksjs/connect-adapter'
import { HttpError } from '@wooksjs/event-http'

const app = connect()

applyConnectAdapter(app)

app.use('/test', () => {
    return { message: 'it works' }
})

app.use('/error', () => {
    throw new HttpError(400, 'test error')
})

app.listen(3000, () => console.log('listening 3000'))
```

### 2. Adapter for WooksHttp API:
This one does not modify anything. It just applies connect middleware and reroutes requests through wooks. Use this one if you want to use wooks app API (compatible with [@moostjs/event-http](https://www.npmjs.com/package/@moostjs/event-http))

```ts
import connect from 'connect'
import { WooksConnect } from '@wooksjs/connect-adapter'
import { useBody } from '@wooksjs/http-body'
import { HttpError } from '@wooksjs/event-http'
import { useRouteParams } from '@wooksjs/event-core'

const connectApp = connect()

const wooksApp = new WooksConnect(connectApp, { raise404: true })

wooksApp.get('/test/:param', () => {
    const { get } = useRouteParams()
    return { message: 'it works', param: get('param') }
})

wooksApp.post('/post', () => {
    const { parseBody } = useBody()
    return parseBody()
})

wooksApp.get('/error', () => {
    throw new HttpError(400, 'test error')
})

wooksApp.listen(8080, () => console.log('listening 8080'))
```
