# http-server

```mermaid
graph TD;

mod(mod.ts)
json(json.ts)
openApi(openApi.ts)
query(query.ts)
body(body.ts)
responseObject(responseObject.ts)
responseHeader(responseHeader.ts)
operation(operation.ts)

json --> body
query --> operation
body --> operation
responseHeader --> responseObject 
body --> responseObject
responseObject --> operation
operation --> openApi
operation --> mod
openApi --> mod
```
