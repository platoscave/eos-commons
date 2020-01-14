# eos-commons.io
Vue.js/Vuetify client for EOS blockchain backend

Under construction.

### Process Universe
eos-commons is built around a class model that encompasses all processes. At the highest level it includes accounts and resources. Resources includes things like pages, views, processes, states etc.
### Extensible
The model is fully extensible meaning, users can add their own classes and objects the inherit from existing classes.
### Page, views, queries
Our page model allows users to drill down through the the data graph, in a master-detal fashion.
### EOS Blockchain
- We use the eosio data store as a nosql data base.
- When processes are executed the state changes are recorded on the blockchain.
- We take advantage of eosio's authorization to guarantee secure transactions
### 3D Diagrams
We have several 3D diagrams that represent various aspects of the model: class model process model etc.

### Demo
These demos are based on static data, not the blockchain
- [Accounts](https://gateway.pinata.cloud/ipfs/QmZsAZcoSXNNB7ZqzQFmeGtqbscozwqgguVizsJMfCTGZd/#/.kmghbh3qovtq)
- [Classmodel](https://gateway.pinata.cloud/ipfs/QmZsAZcoSXNNB7ZqzQFmeGtqbscozwqgguVizsJMfCTGZd/#/.4lk3hxyyfac3) (includes 3D Class Model)
