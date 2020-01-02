#include <eoscommonsio.hpp>

/*float eoscommonsio::stof(std::string s, float def)
    {   
        if (s == "") return def;
        std::size_t i = s.find(".");
        int digits = s.length() - i - 1;
        s.erase(i, 1); 
        return atoi(s.c_str()) / pow(10, digits);
    }*/

ACTION eoscommonsio::upsert(upsert_str payload) {
  name username = payload.username;
  // Will fail if the user does not sign the transaction 
  require_auth( username );
  // or require the contract athority. _self is the account that constructed the contract
  // require_auth( get_self() );

  // See https://nlohmann.github.io/json/
  // https://en.wikibooks.org/wiki/JsonCpp
  // annoying problem https://www.bcskill.com/index.php/archives/714.html

  auto parsedJson = json::parse(payload.common, nullptr, false);
  check(!parsedJson.is_discarded(), "Invalid Json: " + payload.common);
  
  /*
  jsoncons::json_reader reader(payload.common);

  std::error_code ec;
  reader.read(ec);
  if (ec) {
    eosio::print( ec.message());
  }
  */

  
  // Get the key from payload
  check(parsedJson.contains("key"), "Proposed upsert has no key.");
  auto key = name(parsedJson["key"].get<std::string>());

  auto classId = name("aaaaaaaaaaaa");
  auto parentId = name("aaaaaaaaaaaa");

  if(key != name("gzthjuyjca4s")){ // Exception for the root
    if(parsedJson.contains("classId")) {
      // Use the value from payload as foreign key
      classId = name(parsedJson["classId"].get<std::string>());
      // Make sure the foreigne key exsits
      auto common_iterator = commons_tbl.find( classId.value );
      check( common_iterator != commons_tbl.end(), "classId not found" );
    }
    else if(parsedJson.contains("parentId")) {
      // Use the value from payload as foreign key
      parentId = name(parsedJson["parentId"].get<std::string>());
      // Make sure the foreigne key exsits
      auto common_iterator = commons_tbl.find( parentId.value );
      check( common_iterator != commons_tbl.end(), "parentId not found" );
    }
    else check( false, "Must have either parentId or classId" );
  }

  // Collect schema from classes
  // Validate common

  // eosio::print( "parsedJson, ", parsedJson);

  auto common_iterator = commons_tbl.find( key.value );
  if( common_iterator == commons_tbl.end() )
  {
    // username - payer: usually the user
    // [&]: labda function, annomonus
    commons_tbl.emplace(username, [&]( auto& new_common ) {
      new_common.key = key;
      new_common.parentid = parentId;
      new_common.classid = classId;
      new_common.common = payload.common;
    });
  }
  else {
    commons_tbl.modify( common_iterator, _self, [&]( auto& existing_common ) {
      existing_common.parentid = parentId;
      existing_common.classid = classId;
      existing_common.common = payload.common;
    });
  }
}

ACTION eoscommonsio::erase(erase_str payload) {
  name username = payload.username;
  name key = payload.key;
  require_auth(username);

  auto common_iterator = commons_tbl.find(key.value);
  check(common_iterator != commons_tbl.end(), "Record does not exist");
  commons_tbl.erase(common_iterator);

  auto agreementstack_iterator = agreementstack_tbl.find(key.value);
  if(agreementstack_iterator != agreementstack_tbl.end()) {
    agreementstack_tbl.erase(agreementstack_iterator);
  }
}

ACTION eoscommonsio::eraseall(eraseall_str payload) {
  // Example send transactions https://eosio.stackexchange.com/questions/1214/delete-all-multi-index-records-without-iterator
  name username = payload.username;
  require_auth(username);

  for(auto common_iterator = commons_tbl.begin(); common_iterator != commons_tbl.end();) {
      // delete element and update iterator reference
      common_iterator = commons_tbl.erase(common_iterator);
  }

  for(auto agreementstack_iterator = agreementstack_tbl.begin(); agreementstack_iterator != agreementstack_tbl.end();) {
      // delete element and update iterator reference
      agreementstack_iterator = agreementstack_tbl.erase(agreementstack_iterator);
  }
}

ACTION eoscommonsio::addagreement(upsert_str payload) {
  name username = payload.username;
  require_auth(username);

  // Parse the payload
  auto parsedJson = json::parse(payload.common);
  
  // Get the key from agreement
  check(parsedJson.contains("key"), "Proposed agrrement has no key.");
  auto agreementId = name(parsedJson["key"].get<std::string>());

  // Get the Process obj for this agreement. 
  // Use it to determin the the type (classId) of the agreement 

  // Get the processId from agreement 
  check(parsedJson.contains("processId"), "Proposed agrrement has no processId.");
  auto pocsessId = name(parsedJson["processId"].get<std::string>());
/*
  // Get the processObj
  auto process_iterator = commons_tbl.find( pocsessId.value );
  check(process_iterator != commons_tbl.end(), "This agreement processId could not be found.");

  // Parse the processObj
  auto parsedProcessJson = json::parse(process_iterator->common);
  
  // Get the agreementClassId from processObj
  check(parsedProcessJson.contains("agreementClassId"), "Proposed agrrement process has no agreementClassId.");
  auto agreementClassId = name(parsedJson["agreementClassId"].get<std::string>());
  // Use agreementClassId as classId for the new agreement
*/

  // Create the Process stack
  // Initialize it with Initialize state and agreement processId

  // Get the stack for this agreement
  auto agreementstack_iterator = agreementstack_tbl.find( agreementId.value );
  check(agreementstack_iterator == agreementstack_tbl.end(), "This agreement already has a process stack.");

  // Create a processstate with default state and current process. Add it to the stack
  processstate_str processState = { name(pocsessId), name("gczvalloctae") }; 
  std::vector<processstate_str> stack;
  stack.push_back( processState );

  // Update the agreement stack table
  agreementstack_tbl.emplace(username, [&]( auto& new_stack ) {
    new_stack.agreementid = agreementId;
    new_stack.stack = stack;
  });

  // Now add the agreement
  upsert( payload );
}

ACTION eoscommonsio::bumpstate(bumpState_str payload) {
  name username = payload.username;
  name agreementid = payload.agreementid;
  std::string action = payload.action;
  require_auth(username);

  // Get the agreement
  auto commons_iterator = commons_tbl.find( agreementid.value );
  check(commons_iterator != commons_tbl.end(), "Couldn't find the agreement.");
  auto parsedAgreement = json::parse(commons_iterator->common);

  // Get the agreement process stack
  auto agreementstack_iterator = agreementstack_tbl.find( agreementid.value );
  check(agreementstack_iterator != agreementstack_tbl.end(), "Couldn't find the process stack for this agreement.");
  auto stack = agreementstack_iterator->stack;
  
  // Do while state is Initialize or state is a execute, delegate state
  bool executeType = false;
  bool delegateType = false;
  std::string stateId = "";

  do {

    // get the current processstate
    processstate_str currentProcessState = stack.back();

    // If current state is initializing, set the current stateId to the process substateId
    if ( currentProcessState.stateid == name("gczvalloctae") ) { // Initialize state
    
      /*
      // Get the process obj
      auto commons_iterator = commons_tbl.find( currentProcessState.processid.value );
      check(commons_iterator != commons_tbl.end(), "Couldn't find the process obj.");
      auto parsedProcessJson = json::parse(commons_iterator->common);

      // Get the substateId from processObj
      check(parsedProcessJson.contains("substateId"), "Stack process has no substateId.");
      auto substateid = name(parsedProcessJson["substateId"].get<std::string>());

      // Use substateid as current stateId
      currentProcessState.stateid = substateid;*/
      stack.back().stateid = name("aaaaaaaaaaaa");


    }

    // If current state isA Delegate, find the sellerProcessId, add it the the stack
    else if ( isA(currentProcessState.stateid, name("dqja423wlzrb") ) ) { // Delegate state

      // Get the sellerProcessId from agreementObj
      check(parsedAgreement.contains("sellerProcessId"), "agreementObj has no parsedAgreement.");
      auto sellerProcessId = name(parsedAgreement["sellerProcessId"].get<std::string>());

      // Create a processstate with default state and current process. Push it to the stack.
      processstate_str processState = { name(sellerProcessId), name("gczvalloctae") }; 
      std::vector<processstate_str> stack;
      stack.push_back( processState );

    }

    else { 

      // If current state isA Execute, do stuf and set the next action
      if ( isA(currentProcessState.stateid, name("dqja423wlzrb") ) ) { // Execute state
        // Skip for now
        action = "happy";
      }
      
      // Get stateObj from processStackObj.stateId
      auto commons_iterator = commons_tbl.find( currentProcessState.stateid.value );
      check(commons_iterator == commons_tbl.end(), "Couldn't find the state obj.");
      auto parsedStateJson = json::parse(commons_iterator->common);

      // Get the nextStateIds from state obj
      check(parsedStateJson.contains("nextStateIds"), "State process has no nextStateIds.");
      auto nextStateIds = parsedStateJson["nextStateIds"].get<std::string>();
      
      // find action in nextStateIds
      auto nextStateIdTouple = std::find_if(nextStateIds.begin(), nextStateIds.end(), [](const json& x) {
          return x.is_object() and x.value("action", "") == "action"; //<- TODO
      });

      // If found, use the nextStateId
      if (nextStateIdTouple != nextStateIds.end()) {
        // currentProcessState.stateid = nextStateIdTouple.value(); //<- TODO
      }
      else { // We couldn't find a nextStateId, so we return
        // Are we in a sub process? If so, send action to super process
        if( stack.size() > 0) {
          // Remove the top processStack
          stack.pop_back();
        }
        else {
          // Otherwize we are at the end
          if (action == "happy") currentProcessState.stateid = name("3hxkire2nn4v"); // Sucess
          else currentProcessState.stateid = name("zdwdoqpxks2s"); // Failed
          // TODO cleanup agreementstack, Update agreement 
        }
      }

    }
  print("currentProcessState: ", currentProcessState.processid, " ", currentProcessState.stateid);
  print(" newProcessState: ", stack[0].processid, " ", stack[0].stateid);


    // Update the agreement stack table
    agreementstack_tbl.modify( agreementstack_iterator, _self, [&]( auto& existing_stack ) {
      existing_stack.stack = stack;
    });

    // get the current processstate
    currentProcessState = stack.back();


    name stateId = currentProcessState.stateid;
    bool executeType = isA(stateId, name("dqja423wlzrb")); // Execute Type
    bool delegateType = isA(stateId, name("jotxozcetpx2")); // Delegate Type
    
  } while (executeType || delegateType || stateId == "gczvalloctae"); // Initialize


}

// Recusivly get the common. Check to see if the parentId equals saughtId.
bool eoscommonsio::isA ( name key, name saughtId ) {
  auto iterator = commons_tbl.find( key.value );
  check(iterator == commons_tbl.end(), "classId could not be found.");
  if(iterator->classid == saughtId || iterator->parentid == saughtId) return true;
  else if (iterator->parentid) return isA (iterator->parentid, saughtId);
  return false; // no parent class, we are at the root
}


