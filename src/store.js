import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',

  state: {
    classes: {},
    loading: false,
    statusCode: null,
    message: '',
    pages: [],
    pageStates: {},
    pageStateExp: {
      'xxxxxxxxxxxxxxxxx': {
        pageLoaded: false,
        paneWidth: '300px',
        selectedTab: 0,
        tabs: [
          {
            selectedWidget: 0,
            widgets: [
              {
                selectedObj: '',
                expanded: []
              }
            ]
          }
        ]
      }
    }
  },
  getters: {
    getMessage: (state) => {
      return state.statusCode + ' ' + state.message
    }
  },
  mutations: {
    SET_CLASSES_LOADING (state) {
      state.loading = true;
      state.message = 'loading...'
    },
    SET_CLASSES_SUCCESS (state, payload) {
      state.statusCode = payload.statusCode;
      state.message = payload.message;
      state.classes = payload.data;
      state.loading = false
    },
    SET_CLASSES_FAILURE (state, payload) {
      state.statusCode = payload.statusCode;
      state.message = payload.message
    },

    SET_PAGES (state, payload) {
      state.pages = payload
    },

    SET_PAGE_STATE (state, payload) {
      const defaultPageState = {
        [Object.keys(payload)[0]]: {
          paneWidth: '400px',
          selectedTab: 0,
          tabs: []
        }
      };
      state.pageStates = Vue._.merge(defaultPageState, state.pageStates, payload)
    },

    SET_SELECTED_TAB (state, payload) {
      state.pageStates[payload.pageId].selectedTab = payload.selectedTab
    },
    SET_PANE_WIDTH (state, payload) {
      state.pageStates[payload.pageId].paneWidth = payload.paneWidth
    }
  },
  actions: {
    loadCommon (store, id) {
      return new Promise((resolve, reject) => {
        if (store.state.classes[id]) resolve(Vue._.cloneDeep(store.state.classes[id]));
        else {
          this.$http('ipfs.io/ipfs/' + id).then(response => {
            this.store.state[id] = response.data;
            resolve(Vue._.cloneDeep(response.data))
          }, error => {
            reject(error)
          })
        }
      })
    },
    queryArrObj (store, queryObj) {
      let promises = [];
      queryObj.queryArr.forEach((query) => {
        promises.push(store.dispatch('query', {fk: queryObj.fk, query: query, queryNames: queryObj.queryNames}))
      });
      return Promise.all(promises).then((values) => {
        return Vue._.union.apply(null, values)
      })
    },
    query (store, queryObj) {
      // Run the query, return a results object
      const getResultsObj = (queryObj) => {
        let resultsObj = {};
        const docProp = queryObj.query.where.docProp;
        const operator = queryObj.query.where.operator;
        let value = queryObj.query.where.value;
        if (value === '$parentNode.$key') value = queryObj.fk;
        if (docProp === '$key' && operator === 'eq') resultsObj[value] = store.state.classes[value];
        else {
          resultsObj = Vue._.pickBy(store.state.classes, function (item, key) {
            if (operator === 'eq') return item[docProp] === value;
            if (operator === 'lt') return item[docProp] < value;
            if (operator === 'gt') return item[docProp] > value
          })
        }
        return resultsObj
      };
      let resultsObj = getResultsObj(queryObj);

      // Normalize the results so that they are suited for the tree
      let resultsArr = [];
      Object.keys(resultsObj).forEach(key => {
        const item = resultsObj[key];
        // Create a query array for the children, based on join predicate
        let queryArr = [];
        if (queryObj.query.join) {
          queryObj.query.join.forEach((query) => {
            // Query referenced by name
            if (query.queryByName) queryArr.push(queryObj.queryNames[query.queryByName]);
            // Query as object
            else queryArr.push(query)
          })
        }

        // The tree node result
        let result = {
          id: key,
          text: item.title ? item.title : item.name,
          data: {
            queryArr: queryArr,
            queryNames: queryObj.queryNames,
            item: item,
            pageId: queryObj.query.pageId ? queryObj.query.pageId : item.pageId,
            icon: queryObj.query.icon ? queryObj.query.icon : item.icon
          },
          isLeaf: false
        };

        // Find out if the node is a leaf by running the child queries
        result.isLeaf = !queryArr.some((query) => {
          let obj = getResultsObj({fk: key, query: query});
          return Object.keys(obj).length > 0
        });

        resultsArr.push(result)
      });

      return resultsArr
    },
    mergeAncestorClasses (store, classId) {
      return store.dispatch('loadCommon', classId).then((classObj) => {
        if (classObj.parentId) {
          return store.dispatch('mergeAncestorClasses', classObj.parentId).then((parentClassObj) => {
            return Vue._.merge(parentClassObj, classObj)
          })
        } else return classObj
      })
    },
    materializedView (store, viewId) {
      return store.dispatch('loadCommon', viewId).then((viewObj) => {
        if (viewObj.classId) {
          return store.dispatch('mergeAncestorClasses', viewObj.classId).then((classObj) => {
            // Smart Merge
            Object.keys(viewObj.properties).forEach(propName => {
              const classProp = classObj.properties[propName];
              const viewProp = viewObj.properties[propName];
              viewProp.type = classProp.type;
              if (!viewProp.title && classProp.title) viewProp.title = classProp.title;
              if (!viewProp.default && classProp.default) viewProp.default = classProp.default;
              if (!viewProp.readOnly && classProp.readOnly) viewProp.readOnly = classProp.readOnly;
              if (!viewProp.enum && classProp.enum) viewProp.enum = classProp.enum;
              if (!viewProp.pattern && classProp.pattern) viewProp.pattern = classProp.pattern;
              if (!viewProp.query && classProp.query) viewProp.query = classProp.query;
              if (!viewProp.items && classProp.items) viewProp.items = classProp.items;
              if (viewProp.maxLength && viewProp.maxLength > classProp.maxLength) viewProp.maxLength = classProp.maxLength;
              if (viewProp.minLength && viewProp.minLength < classProp.minLength) viewProp.minLength = classProp.minLength;
              if (viewProp.max && viewProp.max > classProp.max) viewProp.max = classProp.max;
              if (viewProp.min && viewProp.min < classProp.min) viewProp.min = classProp.min
            });
            viewObj.required = Vue._.merge(viewObj.required, classObj.required);
            return viewObj
          })
        } else return viewObj
      })
    },
    loadClasses (store) {
      store.commit('SET_CLASSES_LOADING', { loading: true });
      return axios('classes.json')
        .then(response => {
          store.commit('SET_CLASSES_SUCCESS', {
            statusCode: response.status,
            message: response.statusText,
            data: response.data
          })
        })
        .catch(error => {
          store.commit('SET_CLASSES_FAILURE', {
            statusCode: error.status,
            message: error.statusText
          })
        })
    }
  }
});
store.watch(state => state.route, (newPath, oldPath) => {
  const levelsArr = newPath.path.split('/');
  let pagesArr = [];
  for (let level = 1; level < levelsArr.length; level++) {
    let pageStateArr = levelsArr[level].split('.');
    const pageId = pageStateArr[1];
    store.commit('SET_PAGE_STATE', {
      [pageId]: {
        selectedTab: pageStateArr[2] ? parseInt(pageStateArr[2]) : 0,
        selectedWidget: pageStateArr[3] ? parseInt(pageStateArr[3]) : 0
      }
    });
    pagesArr.push({
      selectedObj: pageStateArr[0],
      pageId: pageStateArr[1]
    })
  }
  store.commit('SET_PAGES', pagesArr)
});

// store.dispatch('loadClasses')

export default store
