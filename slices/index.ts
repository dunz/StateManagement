import {combineReducers} from 'redux';
import auth from './auth';
import posts from './posts';
import todos from './todos';

const rootReducer = combineReducers({
  auth,
  todos,
  posts,
});

export type RootState = ReturnType<typeof rootReducer>;

declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}

export default rootReducer;
