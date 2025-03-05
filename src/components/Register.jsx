import { Button, Col, Input, Row } from 'antd'
import React, { useState } from 'react'
import { createUser } from '../config/authCall';

export default function Register() {

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const changeUserName = (inputValue) => {
        setUserName(inputValue.target.value);
    }

    const changePassword = (inputValue) => {
        setPassword(inputValue.target.value);
    }

    const register = () => {
        // console.log(userName);
        // console.log(password);
        createUser(userName, password);
    }

  return (
    <div className='auth-container'>

      <Row>
        <Col xs={24} md={12} className='img-auth-container'>
          <img src='login.jpg' className='img-auth' alt='image auth'></img>
        </Col>
        
        <Col xs={24} md={12} className='auth-fields'>
          <h2>Registrate</h2>

          <Row>
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
            <Button onClick={register} color='purple' variant='solid' style={{fontWeight: 'bold'}}>Register</Button>
          </div>

        </Col>

      </Row>

    </div>
  )
}
