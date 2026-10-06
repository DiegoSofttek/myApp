import { Button, ConfigProvider, Input } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const defaultCopy = {
  brand: 'Frida Product Planner',
  subtitle: 'Sign in to continue',
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  buttonText: 'Sign In',
  errorMessage: 'Invalid email or password',
};

export default function Login({ state = 'default', copy = defaultCopy, initialValues = { email: '', password: '' }, onSubmit }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialValues.email ?? '');
  const [password, setPassword] = useState(initialValues.password ?? '');
  const [localState, setLocalState] = useState(state);
  const [errorMessage, setErrorMessage] = useState(state === 'error' ? copy.errorMessage : '');

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  useEffect(() => {
    setLocalState(state);
    setErrorMessage(state === 'error' ? copy.errorMessage : '');
  }, [state, copy.errorMessage]);

  const theme = useMemo(
    () => ({
      token: {
        colorPrimary: 'var(--primary)',
        colorText: 'var(--text-main)',
        colorTextPlaceholder: 'var(--text-muted)',
        colorBorder: 'var(--border-color)',
        colorBgContainer: 'var(--bg-input)',
        colorTextBase: 'var(--text-main)',
        colorPrimaryHover: 'var(--primary)',
        colorPrimaryActive: 'var(--primary)',
        borderRadius: 8,
        fontFamily: 'var(--font-sans)',
        controlHeightLG: 48,
      },
      components: {
        Input: {
          activeBorderColor: 'var(--primary)',
          hoverBorderColor: 'var(--border-color)',
          activeShadow: '0 0 0 3px rgba(45, 240, 255, 0.12)',
          colorBgContainer: 'var(--bg-input)',
          colorBorder: 'var(--border-color)',
          colorText: 'var(--text-main)',
          colorTextPlaceholder: 'var(--text-muted)',
        },
        Button: {
          defaultShadow: 'none',
          primaryShadow: '0 18px 40px rgba(45, 240, 255, 0.22)',
        },
      },
    }),
    []
  );

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (localState === 'error') {
      setLocalState('default');
      setErrorMessage('');
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (localState === 'error') {
      setLocalState('default');
      setErrorMessage('');
    }
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      onSubmit({ email, password, state: localState });
      return;
    }

    try {
      await signInUser(email, password);
    } catch {
      setLocalState('error');
      setErrorMessage(copy.errorMessage);
    }
  };

  return (
    <ConfigProvider theme={theme}>
      <section className='login-view' data-state={localState}>
        <div className='login-card'>
          <div className='login-logo' aria-hidden='true'>
            <LoginOutlined />
          </div>

          <header className='login-header'>
            <h1>{copy.brand}</h1>
            <p>{copy.subtitle}</p>
          </header>

          {errorMessage ? <div className='login-error'>{errorMessage}</div> : null}

          <div className='login-form'>
            <label className='login-field'>
              <span>{copy.emailLabel}</span>
              <Input
                id='login-email'
                size='large'
                type='email'
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={handleEmailChange}
                autoComplete='email'
              />
            </label>

            <label className='login-field'>
              <span>{copy.passwordLabel}</span>
              <Input.Password
                id='login-password'
                size='large'
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={handlePasswordChange}
                autoComplete='current-password'
              />
            </label>

            <Button id='login-submit-btn' type='primary' size='large' className='login-submit' onClick={handleSubmit}>
              {copy.buttonText}
            </Button>
          </div>
        </div>
      </section>
    </ConfigProvider>
  );
}
