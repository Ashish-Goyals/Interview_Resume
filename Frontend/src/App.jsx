import {RouterProvider} from 'react-router';
import {router} from './app.routes.jsx';
import {InterviewProvider} from './features/interview/interview.context.jsx';
import {AuthProvider} from './features/auth/auth.context.jsx';
import Interview from './features/interview/pages/Interview';
function App () {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
