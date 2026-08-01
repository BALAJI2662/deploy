import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { GoogleAuth } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

interface TokenResponse {
  access_token: string;
}

export default function AuthIcons() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (tokenResponse: TokenResponse) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });

      const userInfo = await res.json();
      if (userInfo) {
        const newData = {
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.picture,
          role: "Empty"
        };

        const response = await dispatch(GoogleAuth(newData));
        console.log(response.payload, " data");
        navigate("/check/verify");
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
  });

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        if (!credentialResponse.credential) {
          console.error('No credential in response');
          return;
        }
        // Decode the JWT credential from Google One Tap
        const base64Payload = credentialResponse.credential.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));

        const newData = {
          name: decodedPayload.name,
          email: decodedPayload.email,
          image: decodedPayload.picture,
          role: "Empty"
        };

        const response = await dispatch(GoogleAuth(newData));
        console.log(response.payload, " google one-tap data");
        navigate("/check/verify");
      } catch (error) {
        console.error('Google One Tap login failed:', error);
      }
    },
    onError: () => {
      console.log('Google One Tap Login Failed');
    },
  });

  return (
    <div className=" w-full h-fit flex justify-center items-center mt-10">
      <Button variant={'outline'} type='button'
        onClick={() => login()}
        className="w-full h-fit flex items-center justify-center gap-4 px-5 py-2 border border-border hover:bg-muted"
        style={{ minWidth: '240px' }}
      >

        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12
              c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20
              c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
              C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
              c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002
              l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>

       
        <span className="text-muted-foreground font-semibold">Sign in with Google</span>
      </Button>
    </div>
  );
}