// install react-navigation

//TODO: import four screens
import HomeScreen from './screens/HomeScreen';
import AddNewContact from './screens/AddNewContact';
import ViewContact from './screens/ViewContact';
import EditContact from './screens/EditContact';
//TODO: import firebase
import * as firebase from 'firebase';
// set up react navigation
import { createStackNavigator, createAppContainer } from "react-navigation";
import {Platform, InteractionManager} from 'react-native';

const _setTimeout = global.setTimeout;
const _clearTimeout = global.clearTimeout;
const MAX_TIMER_DURATION_MS = 60 * 1000;
if (Platform.OS === 'android') {
    // Work around issue `Setting a timer for long time`
    // see: https://github.com/firebase/firebase-js-sdk/issues/97
    const timerFix = {};
    const runTask = (id, fn, ttl, args) => {
        const waitingTime = ttl - Date.now();
        if (waitingTime <= 1) {
            InteractionManager.runAfterInteractions(() => {
                if (!timerFix[id]) {
                    return;
                }
                delete timerFix[id];
                fn(...args);
            });
            return;
        }

        const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS);
        timerFix[id] = _setTimeout(() => runTask(id, fn, ttl, args), afterTime);
    };

    global.setTimeout = (fn, time, ...args) => {
        if (MAX_TIMER_DURATION_MS < time) {
            const ttl = Date.now() + time;
            const id = '_lt_' + Object.keys(timerFix).length;
            runTask(id, fn, ttl, args);
            return id;
        }
        return _setTimeout(fn, time, ...args);
    };

    global.clearTimeout = id => {
        if (typeof id === 'string' && id.startsWith('_lt_')) {
            _clearTimeout(timerFix[id]);
            delete timerFix[id];
            return;
        }
        _clearTimeout(id);
    };
}
const MainNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Add: { screen: AddNewContact },
    View: { screen: ViewContact },
    Edit: { screen: EditContact }
  },
  {
    defaultNavigationOptions: {
      headerTintColor: "#fff",
      headerStyle: {
        backgroundColor: "#7b1fa2"
      },
      headerTitleStyle: {
        color: "#fff"
      }
    }
  }
);

const App = createAppContainer(MainNavigator);

//TODO: Initialize Firebase

var firebaseConfig = {
  apiKey: "AIzaSyBx6xED17Owsu3-QHIJ4lJdx9wAYHkLWKE",
  authDomain: "reactbootcamp-a2527.firebaseapp.com",
  databaseURL: "https://reactbootcamp-a2527.firebaseio.com",
  projectId: "reactbootcamp-a2527",
  storageBucket: "reactbootcamp-a2527.appspot.com",
  messagingSenderId: "257872510416",
  appId: "1:257872510416:web:93735d176923bfb3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


//FirebaseTODO create firebase real-time database with rules

// {
//   "rules": {
//     ".read": true,
//     ".write": true
//   }
// }
export default App;