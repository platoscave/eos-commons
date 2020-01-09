#include <eosio/eosio.hpp>
#include <eosio/print.hpp>
#include <eosio/system.hpp>
#include <src/nlohmann/json-schema.hpp>
#include <src/nlohmann/json.hpp>
//#include <ctime>
// #include <jsoncons/json_reader.hpp>
// https://github.com/pboettch/json-schema-validator

// using jsoncons::json;
using nlohmann::json;
using nlohmann::json_schema::json_validator;

using namespace eosio;

CONTRACT eoscommonsio : public contract {
  private:
    TABLE commons_str {
      name key;
      name parentid;
      name classid;
      std::string common;
      
      uint64_t primary_key() const { return key.value; }
      uint64_t by_parentid() const { return parentid.value; }
      uint64_t by_classid() const { return classid.value; }
    };
    
    typedef multi_index<name("commonstable"), commons_str, 
      indexed_by<name("byparentid"), const_mem_fun<commons_str, uint64_t, &commons_str::by_parentid>>, 
      indexed_by<name("byclassid"), const_mem_fun<commons_str, uint64_t, &commons_str::by_classid>>> commonstable_def;
      
    commonstable_def commons_tbl;

    struct processstate_str {
      name processid;
      name stateid;
      bool done;
      time_point_sec created_at;
    };

    
    TABLE agreementstack_str {
      name agreementid;
      std::vector<processstate_str> stack;
      
      uint64_t primary_key() const { return agreementid.value; }
    };

    typedef multi_index<name("stacktable"), agreementstack_str> agreementstack_def;

    agreementstack_def agreementstack_tbl;
    
    bool isA( name parentId, name saughtId );
  

  public:
    using contract::contract;
    eoscommonsio(name receiver, name code, 
      datastream<const char*> ds):contract(receiver, code, ds), 
      commons_tbl(receiver, receiver.value), 
      agreementstack_tbl(receiver, receiver.value) {}
    
    struct upsert_str {
      name username;
      std::string common;
      EOSLIB_SERIALIZE( upsert_str, (username) (common) )
    };
    ACTION upsert(upsert_str payload);
    
    ACTION addagreement(upsert_str payload);

    struct erase_str {
      name username;
      name key;
      EOSLIB_SERIALIZE( erase_str, (username) (key))
    };
    ACTION erase(erase_str payload);
    
    struct eraseall_str {
      name username;
      EOSLIB_SERIALIZE( eraseall_str, (username) )
    };
    ACTION eraseall(eraseall_str payload);
   
    struct bumpState_str {
      name username;
      name agreementid;
      std::string action;
      EOSLIB_SERIALIZE( bumpState_str, (username) (agreementid) (action))
    };
    ACTION bumpstate(bumpState_str payload);
   
};

