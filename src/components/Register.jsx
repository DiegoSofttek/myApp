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

    const register = () => {
      // console.log(userName);
      // console.log(password);
      
      try{
        const userCredential = createUser('users', userName, password, name, lastname)
        console.log(userCredential);

      }catch(error){
        console.log(error);
      }
    }

  return (
    <div className='auth-container'>

      <Row>
        <Col xs={24} md={12} className='img-auth-container'>
          <img src='login.jpg' className='img-auth' alt='image auth'></img>
        </Col>
        
        <Col xs={24} md={12} className='register-fields'>
          <h2>Regístrate</h2>

          <Row>
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

          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'end', margin: '2rem 0 0 0'}}>
            <Button onClick={register} color='purple' variant='solid' style={{fontWeight: 'bold'}}>Regístrate</Button>
          </div>

        </Col>

      </Row>

    </div>
  )
}
