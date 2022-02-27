import React from 'react';
import {Provider} from 'react-redux';
import rootReducer from './slices';
import AuthApp from './components/AuthApp';
import TodoApp from './components/TodoApp';
import {configureStore} from '@reduxjs/toolkit';
import PostsApp from './components/PostsApp';
import {RecoilRoot} from 'recoil';

// const store = createStore(rootReducer);
const store = configureStore({reducer: rootReducer});

const App = () => {
  return (
    // <Provider store={store}>
    //   <AuthApp />
    //   {/*<TodoApp />*/}
    //   {/*<PostsApp />*/}
    // </Provider>
    <RecoilRoot>
      {/*<AuthApp />*/}
      {/*<TodoApp />*/}
      <PostsApp />
    </RecoilRoot>
  );
};

export default App;
