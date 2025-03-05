import { Button, Col, Input, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login({mail}) {

    const {user} = useAuth();
    const navigate = useNavigate();

    const [userName, setUserName] = useState(mail);
    const [password, setPassword] = useState('');

    const changeUserName = (inputValue) => {
      setUserName(inputValue.target.value);
    }

    const changePassword = (inputValue) => {
      setPassword(inputValue.target.value);
    }

    useEffect(() => {
      if(user){
        navigate('/home');
      }
    }, [user]);

    //Nos puede funcionar cuando la función signInUser es asincrona
    // const login = async () => {
    //   // console.log(userName);
    //   // console.log(password);
    //   try {
    //       await signInUser(userName, password);
    //       navigate('/home');
    //   } catch (error) {
    //       console.error('Error during login:', error);
    //   }
    // }

    const login = () => {
      signInUser(userName, password);
    }

  return (
    <div className='auth-container'>
      {/* {JSON.stringify(user)} */}
      {/* {JSON.stringify(user.providerData[0].uid)} */}
      
      <Row>
        <Col xs={24} md={12} className='img-auth-container'>
          <img src='login.jpg' className='img-auth' alt='image auth'></img>
        </Col>

        <Col xs={24} md={12} className='auth-fields'>
          <h2>Inicía Sesión</h2>
          
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
            <Button onClick={login} color='purple' variant='solid' style={{fontWeight: 'bold'}}>Log In</Button>
          </div>
        </Col>
      </Row>
    </div>
  )
}
