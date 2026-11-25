import { Button, Col, Input, Row } from 'antd'
import { useEffect, useState } from "react";
import { createUser } from "../config/authCall";
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Register() {

    const {user} = useAuth();
    const navigate = useNavigate();

    const [userName, setUserName] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
      if(user) navigate('/home');
    }, [user, navigate]);

    const changeName = (inputValue) => {
      setName(inputValue.target.value);
    }

    const changeLastname = (inputValue) => {
      setLastname(inputValue.target.value);
    }

    const changeUserName = (inputValue) => {
      setUserName(inputValue.target.value);
    }

    const changePassword = (inputValue) => {
      setPassword(inputValue.target.value);
    }

    const register = async() => {
      // console.log(userName);
      // console.log(password);
      
      try{
        await createUser('users', userName, password, name, lastname)
        //console.log(userCredential);

      }catch{
        setError('Error al registrate');
      }
    }

  return (
    <div className='auth-container'>

      <Row>
        <Col xs={24} md={12} className='img-auth-container'>
          <img src='login.jpg' className='img-auth' alt='Ilustración de autenticación'></img>
        </Col>
        
        <Col xs={24} md={12} className='register-fields'>
          <h2>Regístrate</h2>

          {error && <p className='error'>{error}</p>}

          <Row gutter={[10, 10]}>
            <Col xs={24}>
              <label>Nombre:</label>
              <Input
                size='large'
                type='text'
                placeholder='Nombre'
                className='input'
                value={name}
                onChange={changeName}
              >
              </Input>
            </Col>

            <Col xs={24}>
              <label>Apellido:</label>
              <Input
                size='large'
                type='text'
                placeholder='Apellido'
                className='input'
                value={lastname}
                onChange={changeLastname}
              >
              </Input>
            </Col>

            <Col xs={24}>
                <label htmlFor='email' id='email-label'>Email:</label>
                <Input
                    id='email'
                    aria-labelledby='email-label'
                    size='large'
                    type="email"
                    placeholder="Email"
                    value={userName}
                    onChange={changeUserName}
                    className='input'
                >
                </Input>
            </Col>

            <Col xs={24}>
                <label htmlFor='password' id='password-label'>Password:</label>
                <Input.Password
                    id='password'
                    aria-labelledby='password-label'
                    size='large'
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={changePassword}
                    className='input'
                >
                </Input.Password>
            </Col>
          </Row>

          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'end', marginTop: '2rem'}}>
            <Button 
              onClick={register} 
              color='purple' 
              variant='solid' 
              style={{fontWeight: 'bold'}}
              disabled={!name || !lastname || !userName || !password}
            >Regístrate</Button>
          </div>

        </Col>

      </Row>

    </div>
  )
}
