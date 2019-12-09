import Vue from 'vue'
const eosjs = require('eosjs');
const JSZip = require("jszip");
import BigNumber from 'bignumber.js/bignumber'



class GernnerateCpp {


    static async GenerateCpp(store) {

        // Recusivly merge all the ancestor classes, starting with the root. Sub class properties take precedence over parent class
        const getMergeAncestorClasses = async classId => {
            let classObj = await store.dispatch("getCommonByKey", classId)
            if (classObj.parentId) {
                let parentClassObj = await getMergeAncestorClasses(classObj.parentId)
                return Vue._.mergeWith(parentClassObj, classObj, (a, b) => {
                    if (_.isArray(a)) return a.concat(b) // Arrays must be concanated instead of merged
                })
            } else return classObj
        }


        // let zip = new JSZip();
        let classObj = await getMergeAncestorClasses('pejdgrwd5qso')
        return this.hpp(classObj)

    }
    static generateUpsertString(properties) {
        let upsertSrting = ''
        for (let key in properties) {
            const prop = properties[key]
            if (prop.type === 'string') {
                if (prop.pattern === '[.abcdefghijklmnopqrstuvwxyz12345]{12}') upsertSrting += `      name ${key},\n`
                else upsertSrting += `      std::string ${key},\n`
            }
            else if (prop.type === 'number') {
                upsertSrting += `      std::float64 ${key},\n`
            }
            else if (prop.type === 'boolean') {
                upsertSrting += `      std::bool ${key},\n`
            }
            else if (prop.type === 'date') {
                upsertSrting += `      std::time_point_sec ${key},\n`
            }
            else if (prop.type === 'object') {
                if (prop.property){
                    upsertSrting += `      // OBJECT ${key},\n`
                } 
            }
            else if (prop.type === 'array') {
                if (prop.items){
                    upsertSrting += `      std::vector<${key}_struct> ${key},\n`
                } 
            }
        }
        let lastTwo = upsertSrting.substr(upsertSrting.length - 2)
        if(lastTwo === ',\n') upsertSrting = upsertSrting.substring(0, upsertSrting.length - 2)
        return  upsertSrting
    }

    static hpp(classObj) {

        const className = Vue._.camelCase(classObj.title);
        const tableName = classObj.key;

        let keyStruct = ''
        for (let key in classObj.properties) {
            if (key === 'key') keyStruct += `\n      uint64_t primary_key() const { return key.value; }\n`
            else {
                const prop = classObj.properties[key]
                if (prop.pattern === '[.abcdefghijklmnopqrstuvwxyz12345]{12}') keyStruct += `      uint64_t by_${key}() const { return ${key}.value; }` + '\n'
            }
        }        
        let lastOne = keyStruct.substr(keyStruct.length - 1)
        if(lastOne === '\n') keyStruct = keyStruct.substring(0, keyStruct.length - 1)

        let tableStructs = this.generateTableStructs(className, classObj.properties, keyStruct)

        let upsertSrting = this.generateUpsertString(classObj.properties)

        let indexSrting = ''
        for (let key in classObj.properties) {
            if (key !== 'key') {
                let lowerCaseKey = key.toLowerCase()
                const prop = classObj.properties[key]
                if (prop.pattern === '[.abcdefghijklmnopqrstuvwxyz12345]{12}') 
                    indexSrting += `      indexed_by<name("${lowerCaseKey}"), const_mem_fun<${className}_struct, uint64_t, &${className}_struct::by_${key}>>,\n`
            }
        }
        let lastTwo = indexSrting.substr(indexSrting.length - 2)
        if(lastTwo === ',\n') indexSrting = indexSrting.substring(0, indexSrting.length - 2)

        let validateString = this.generateValidateHpp(className, classObj.properties)

        let hppString =
`#include <eosio/eosio.hpp>
#include <eosio/print.hpp>

using namespace eosio;

// ${classObj.title} Contract

CONTRACT ${className} : public contract {
  public:
    using contract::contract;
    ${className}(name receiver, name code, datastream<const char*> ds):
        contract(receiver, code, ds), 
        ${className}(receiver, receiver.value) {}
    
    ACTION upsert(name username, 
${upsertSrting});

    ACTION erase(name username, name key);
    
    ACTION eraseall(name username);
  
  private:

${tableStructs}
    
    typedef multi_index<name("${tableName}"), ${className}_struct, 
${indexSrting}
      > ${className}_table;
    
    ${className}_table ${tableName};

${validateString}

};`

        return hppString

    }

    static generateTableStructs(structName, properties, keyStruct) {
        let tableStruct = ''
        for (let key in properties) {
            const prop = properties[key]
            if (prop.type === 'string') {
                if (prop.pattern === '[.abcdefghijklmnopqrstuvwxyz12345]{12}') tableStruct += `      name ${key};\n`
                else tableStruct += `      std::string ${key};\n`
            }
            if (prop.type === 'array') {
                tableStruct += `      std::vector<${key}_struct> ${key};\n`
            }
        }
        let lastOne = tableStruct.substr(tableStruct.length - 1)
        if(lastOne === '\n') tableStruct = tableStruct.substring(0, tableStruct.length - 1)

        let tableStructString =
`    TABLE ${structName}_struct {
${tableStruct}${keyStruct}
    };

`
        for (let key in properties) {
            const prop = properties[key]
            if (prop.type === 'array') {
                tableStructString += this.generateTableStructs(key, prop.items.properties, '')
            }
        }
        return tableStructString

    }

    static generateValidateHpp(structName, properties) {
        let upsertSrting = this.generateUpsertString(properties)

        let validateString =
`    void validate_${structName}(
${upsertSrting}
    );

`
        for (let key in properties) {
            const prop = properties[key]
            if (prop.type === 'array') {
                validateString += this.generateValidateHpp(key, prop.items.properties)
            }
        }
        return validateString

    }

    static async cpp(classObj) {

        const className = Vue._.camelCase(classObj.title);
        const tableName = classObj.key;

        let tableStruct = ''
        for (let key in classObj.properties) {
            tableStruct += `      iter_${className}.${key} = ${key};\n`
        }
        let lastOne = tableStruct.substr(tableStruct.length - 1)
        if(lastOne === '\n') tableStruct = tableStruct.substring(0, tableStruct.length - 1)
        
        let upsertSrting = ''
        for (let key in classObj.properties) {
            const prop = classObj.properties[key]
            if (prop.type === 'string') {
                if (prop.pattern === '[.abcdefghijklmnopqrstuvwxyz12345]{12}') upsertSrting += `  name ${key},\n`
                else upsertSrting += `  std::string ${key},\n`
            }
            else if (prop.type === 'number') {
                upsertSrting += `  std::float64 ${key},\n`
            }
            else if (prop.type === 'boolean') {
                upsertSrting += `  std::bool ${key},\n`
            }
            else if (prop.type === 'date') {
                upsertSrting += `  std::time_point_sec ${key},\n`
            }
            else if (prop.type === 'object') {
                if (prop.property){
                    upsertSrting += `  std::string ${key},\n`
                } 
            }
            else if (prop.type === 'array') {
                if (prop.items){
                    upsertSrting += `  std::string  ${key},\n`
                } 
            }
        }
        let lastTwo = upsertSrting.substr(upsertSrting.length - 2)
        if(lastTwo === ',\n') upsertSrting = upsertSrting.substring(0, upsertSrting.length - 2)
        
        let validateSrting = ''
        for (let key in classObj.properties) {
            const prop = classObj.properties[key]
            if(prop.pattern === '[.abcdefghijklmnopqrstuvwxyz12345]{12}') {
                validateSrting += `    // perform regex on ${key}\n`
                if(prop.query && prop.query.where) {
                    validateSrting += `    // lookup ${key} in table ${prop.query.where[0].value}\n`
                }
            }
            if (prop.maxLength) validateSrting += `    eosio_assert(${key}.size() <= ${prop.maxLength}, "${className}::${key} must be shorter or equal to ${prop.maxLength} bytes");\n`
            if (prop.minLength) validateSrting += `    eosio_assert(${key}.size() >= ${prop.minLength}, "${className}::${key} must be longer or equal to ${prop.minLength} bytes");\n`
            if (prop.max) validateSrting += `    eosio_assert(${key} <= ${prop.max}, "${className}::${key} must be less than or equal to ${prop.max} bytes");\n`
            if (prop.min) validateSrting += `    eosio_assert(${key} >= ${prop.min}, "${className}::${key} must be greater than or equal to ${prop.min} bytes");\n`
            if (prop.format === 'date-time') validateSrting += `    // validate date-time;\n`
            if (prop.enum) {
                validateSrting += `    // validate enum;\n`
            }
            if (prop.media && prop.media.mediaType === 'text/html' ) validateSrting += `    // validate text/html(!${key}\n`
        }
        lastOne = tableStruct.substr(tableStruct.length - 1)
        if(lastOne === '\n') tableStruct = tableStruct.substring(0, tableStruct.length - 1)

        let cppString =
`#include <${className}.hpp>

// ${classObj.title} Contract

ACTION ${className}::upsert(name user, 
${upsertSrting}) {
  // Will fail if the user does not sign the transaction 
  require_auth( user );
  // or require the contract athority
  // require_auth( get_self() );
  
  auto ${className}_iterator = ${tableName}.find(key.value);
  if( ${className}_iterator == ${tableName}.end() )
  {
    // payer: usually the user
    // [&]: labda function, annomonus
    ${className}_iterator = ${tableName}.emplace(user, [&]( auto& iter_${className} ) {
${tableStruct}
    });
  }
  else {
    ${tableName}.modify( ${className}_iterator, _self, [&]( auto& iter_${className} ) {
${tableStruct}
    });
  }
}

ACTION ${className}::erase(name user, name key) {
  require_auth(user);

  auto ${className}_iterator = ${tableName}.find(key.value);
  check(${className}_iterator != ${tableName}.end(), "Record does not exist");
  ${tableName}.erase(${className}_iterator);
}

ACTION ${className}::eraseall(name user) {
  require_auth(user);

  for(auto ${className}_iterator = ${tableName}.begin(); ${className}_iterator != ${tableName}.end();) {
      // delete element and update iterator reference
      ${className}_iterator = ${tableName}.erase(${className}_iterator);
  }
}

bool ${className}::validateObject(
${upsertSrting}
){
${validateSrting}
    return true;
}

EOSIO_DISPATCH(${className}, (upsert)(erase)(eraseall))
`

        return cppString
    }
}

export default GernnerateCpp