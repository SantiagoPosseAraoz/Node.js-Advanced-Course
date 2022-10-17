#Title
##another title
```js

const setupDatabase = require("platziverse-db")

setupConfig = setupDatabase(config).then(db=>{
    const {Agent, Metric}= db
}).catch(err => console.error(err))
```