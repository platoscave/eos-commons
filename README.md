# eos-commons.io
Bringing Process Modeling to the Blockchain

Vue.js/Vuetify client for EOS blockchain backend

Work in progress.

### Process Universe
eos-commons is built around a class model that encompasses all processes. At the highest level it includes accounts and resources. Resources includes things like pages, views, processes, states etc.
### Extensible
The model is fully extensible meaning, users can add their own classes and objects that inherit from existing classes. They do so in their own space. 
### Page, views, queries
Our highly flexible page model allows users to drill down through the the data graph, in a master-detal fashion.
### EOS Blockchain
- We use the eosio data store as a nosql data base.
- When processes are executed the state changes are recorded on the blockchain.
- We take advantage of eosio's authorization to guarantee secure transactions.
### 3D Diagrams
Really cool 3D diagrams that represent various aspects of the model: class model process model, workflow model etc.

### Demo
These demos are based on static data, not the blockchain
- [Accounts](https://gateway.pinata.cloud/ipfs/QmZsAZcoSXNNB7ZqzQFmeGtqbscozwqgguVizsJMfCTGZd/#/.kmghbh3qovtq./bicycleshop1.2kjjzqr2i5o5.1/bicycleshop1.h5syw45c3qg1./4htc3ykicyzj.tet4swafvc2k.)
- [Classmodel](https://gateway.pinata.cloud/ipfs/QmZsAZcoSXNNB7ZqzQFmeGtqbscozwqgguVizsJMfCTGZd/#/.4lk3hxyyfac3./gzthjuyjca4s.24cnex2sayeh.1/gzthjuyjca4s..) (includes 3D Class Model)
