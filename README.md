# Welcome
## How to use
```js

const setupDatabase = require("platziverse-db")

setupConfig = setupDatabase(config).then(db=>{
    const {Agent, Metric}= db
}).catch(err => console.error(err))
```