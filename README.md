## 리덕스

### 개요
- action: 변화를 정의하는 객체
  - action type: 문자열, 주로 대문자 사용
- action 생성함수: action 객체를 만들어주는 함수
  - 함수를 재사용하여 action을 생성할 수 있도록 액션생성함수를 만듬
- reducer 함수: state와 action 을 파라미터로 받아서 업데이트된 상태 반환
  - useReducer와 다른점은 초기 상태를 기본 파라미터 문법을 사용해 state = initialState 형식으로 지정해주어야 함
  - 상태의 불변성을 유지하면서 업데이트 해주어야 함

### 루트 리듀서 만들기
- 여러 리듀서를 합치기 위해 combineReducers를 사용하여 rootReducer 생성
- createStore에 rootReducer를 담아 스토어를 만들고 그 안에는 상태 조회용 getState함수와 액션을 일으키는 dispatch 함수가 있다
- 컴포넌트에서 사용할때는 react-redux에서 제공하는 Provider로 컴포넌트를 감싼다
- react-redux에서 제공하는 useSelector로 리덕스 상태조회, useDispatch로 액션을 발생시켜 상태를 업데이트한다

```tsx
import {useSelector, useDispatch} from 'react-redux';
import {increase, decrease} from './modules/counter'

function Counter() {
  const value = useSelector(state => state.counter.value)
  const dispatch = useDispatch()
  const onPressIncrease = () => {
    dispatch(increase())
  }
  const onPressDecrease= () => {
    dispatch(decrease())
  }
}
```
- useSelector 훅에 셀렉터 함수를 넣어주고 이 함수의 state파라미터는 스토어의 현재 상태를 가리킨다
- useSelector를 사용하면 조회한 상태가 바뀔 때마다 컴포넌트가 렌더링 된다
- useSelector는 최적화되어 있기 때문에 원하는 상태가 바뀔때만 리렌더링 된다

## Redux Toolkit
리덕스의 작성해야하는 코드의 양이 많은 번거로움을 해결하기 위해 리덕스 개발팀에서 만든게 Redux Toolkit

- 모듈을 작성할 때 액션타입, 액션생성함수, 리듀서를 한번에 작성할 수 있다
- 상태를 직접 업데이트 할때 내장된 immer를 사용해서 불변성을 유지하면서 업데이트 해준다

```tsx
import {createSlice} from '@reduxjs/toolkit'

interface CounterState {
  value: number
}
const initialState: CounterState = {value: 1}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increase(state, action) {
      state.value += 1
    },
    decrease(state, action) {
      state.value -= 1
    },
    increaseBy(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
    decreaseBy(state, action: PayloadAction<number>) {
      state.value -= action.payload
    },
  }
})

export const {increase, decrease, increaseBy, decreaseBy} = counterSlice.actions
export default counterSlice.reducer
```
- createSlice를 사용하면 액션생성함수와 리듀서를 동시에 만들기 때문에 액션타입을 따로 선언하지 않아도 됨
- counterSlice.actions 액션생성함수들이 들어있는 객체를 counterSlice.reducer는 리듀서 함수를 가리킴
- 액션 타입을 조회할 일이 생기면 액션생성함수의 type필드를 확인한다 (increase.type)
- slice의 name은 액션타입이 만들어질때 name/액션 의 형탱로 만들어 진다
- 액션에 넣어줄 값의 이름이 payload로 통일된다

## 리덕스로 사용자 인증기능 구현하기
### useSelector를사용할때 RootState 로 파라미터 타입을 안불러오게 하는 방법으로 타입 선언을 한다
```tsx
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}
```

### bindActionCreators 사용
훅을 만들때 `bindActionCreators`의 인자로 리듀서의 액션생성함수를 객체로 넣어주고 두번째 dispatch를 넣어주면

dispatch 하기위해 함수를 한번 감싸는 작업을 자동으로 해준다
`hooks/useAuthActions.ts`
```tsx
import {useDispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {authorize, logout} from '../slices/auth';
import {useMemo} from 'react';

export default function useAtuhActions() {
  const dispatch = useDispatch();
  return useMemo(() => bindActionCreators({authorize, logout}, dispatch), []);
}
```

### 액션생성함수의 커스터마이징
`slices/todos.ts`
```tsx
reducers: {
  add: {
    prepare(text: string) {
      const prepared = {payload: {id: nextId, text}};
      nextId += 1;
      return prepared;
    },
    reducer(state, action: PayloadAction<{id: number; text: string}>) {
      state.push({
        ...action.payload,
        done: false,
      });
    },
  },
}
```
prepare와 reducer함수가 있는 객체를 넣어주게 되면 액션생성함수가 호출되기 전 prepare 함수가 먼저 호출되어

해당 함수 내에서 payload를 지닌 객체를 반환하도록 구현할수 있다

## 리덕스 미들웨어를 사용하여 REST API 요청 상태 관리하기
리덕스에서 비동기 작업을 처리할 때는 미들웨어라는 기능을 사용한다
- redux-thunk: 함수를 기반으로 작동
- redux-saga: Generator를 기반으로 작동
- redux-observable: Rxjs를 기반으로 작동

redux-thunk는 액션생성함수에서 객체가 아닌 dispatch를 파라미터로 받아오는 함수를 반환한다

그로인해 원하는 시점에 dispatch를 사용함으로써 비동기 작업을 처리할 수 있다

## 미들웨어 적용하기
`App.tsx`
```tsx
const store = configureStore({reducer: rootReducer});
// const store = createStore(rootReducer, applyMiddleware(thunk));
```

configureStore는 내부적으로 thunk 미들웨어를 사용한다

### posts 모듈 만들기
`slices/posts.ts`
```tsx
export const fetchPosts = createAsyncThunk('posts/fetchUsers', getPosts);
```

createAsyncThunk함수는 Promise를 반환하는 함수를 기반으로 함수가 호출됐을때 성공하거나 실패했을때 사용할 액션들을 제공한다
- fetchPosts.pending
- fetchPosts.resolved
- fetchPosts.rejected

```tsx
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchPosts.pending.type]: (state) => {
      // 요청이 시작했을 때, loading을 false 로 설정하고 나마저 값들은 null 로 설정합니다.
      state.posts = {
        loading: true,
        data: null,
        error: null,
      };
    },
    [fetchPosts.fulfilled.type]: (state, action: PayloadAction<Post[]>) => {
      // 요청이 성공했을 때, loading을 false로 하고 data 값을 설정합니다.
      state.posts.data = action.payload;
      state.posts.loading = false;
    },
    [fetchPosts.rejected.type]: (state, action: PayloadAction<Error>) => {
      // 요청이 실패했을 때, loading을 false로 하고 error 값을 설정합니다.
      state.posts.error = action.payload;
      state.posts.loading = false;
    },
  },
});
```

createSlice할때 fetchPosts를 통하여 dispatch된 액션들을 처리하는 리듀서 함수들은 extraReducers에 작성한다

## 리코일 살펴보기
```tsx
const counterState = atom({
  key: 'counterState',
  default: 0
})
```

- 리코일에서는 atom을 사용하여 상태를 정의한다
- 고유값 key를 설정하고 default로 기본값을 설정한다
- useRecoilState: useState와 비슷하게 배열의 첫번째 원소는 상태, 두번째는 상태를 업데이트하는 함수가 반환된다
- useRecoilValue: 업데이트는 필요없고 값만 필용할때 사용할 수 있다
- useSetRecoilState: 값은 필요없고 업데이트 함수만 필요할때 사용할 수 있다
- RecoilRoot는 리덕스의 Provider와 비슷한 역할을 한다(여러번 사용가능)
  - 가장 가까운 RecoilRoot를 사용한다
- Selector기능은 리코일에서 관리하는 상태의 특정 부분만 선택할 때 사용
  - 또는 상태를 사용하여 연산한 값을 조회할 때도 사용(computed)

### useRecoilCallback을 사용하여 최적화하기
```tsx
const fn = useRecoilCallback(({snapshot}) => async (params) => {
  const counter = await snapshot.getPromise(counterState)
  // 현재 counter 값을 조회한 후 특정 작업 수행
}, [])
```
- useRecoilCallback의 첫번째 인자에는 사용할 콜백함수를 반환하는 함수를 넣고 두번째 인자에는 의존배열을 넣는다
- snapshot.getPromise를 사용하면 리코일 상태를 조회할 수 있으며 Promise를 반환한다

