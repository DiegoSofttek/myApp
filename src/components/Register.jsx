import { Button, Col, Input, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { createUser, createUserDocument } from '../config/authCall';
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
    }, [user]);

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

      }catch(error){
        //console.log(error);
        setError('Error al registrate');
      }
    }

  return (
    <div className='auth-container' style={{ width: 'min(1150px, 92vw)', margin: '64px auto 0' }}>

      <Row style={{ width: '100%', minHeight: '560px' }}>
        <Col xs={24} md={12} className='img-auth-container' style={{ minHeight: '560px' }}>
          <img src='login.jpg' className='img-auth' alt='image auth' style={{ width: '100%', height: '100%', objectFit: 'cover' }}></img>
        </Col>
        
        <Col xs={24} md={12} className='register-fields' style={{ minHeight: '560px', margin: 0, padding: '56px 56px 40px' }}>
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
                <label>Email:</label>
                <Input
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
                <label>Password:</label>
                <Input.Password
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
              size='large'
              style={{fontWeight: 'bold', minWidth: '114px'}}
            >Regístrate</Button>
          </div>

        </Col>

      </Row>

    </div>
  )
}
