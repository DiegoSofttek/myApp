import { Button, Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import { readDataUserFirestore } from '../config/firestoreCalls';

export default function Navbar() {

  const {user, logout} = useAuth();
  const [localUser, setLocalUser] = useState(null);
  const navigate = useNavigate();

  // const getEmail = () => {
    
  //   if(user){

  //     let email = JSON.stringify(user.providerData[0].email);
  //     email = email.replace(/"/g, '');

  //     return email;
  //   }
  // }

  useEffect(() => {

    if(user){
      readUser();
    }else{
      setLocalUser(null); //Limpiar el estado del usuario cuando se desloguea
    }

  }, [user]);

  const readUser = async () => {

    //
    //Hecho con realtime database
    // const lcUser = await readData('users', 'email', user.email);

    // if(lcUser.val()){
    //   const userData = lcUser.val();
    //   const userKeys = Object.keys(userData);

    //   console.log(userData[userKeys[0]]);
    //   setLocalUser(userData[userKeys[0]]);
    // }else{
    //   return '';
    // }

    const lcUser2 = await readDataUserFirestore('users', 'email', user.email);

    if(!lcUser2.empty){
      //console.log(lcUser2.docs[0].data());
      const userData = lcUser2.docs[0].data();
      setLocalUser(userData);
    }
  }

  // if (!localUser) {
  //   return null; // O muestra un mensaje de carga o un componente alternativo
  // }

  // //console.log(localUser.name.split(" ", 4)[0]);
  // // var name = localUser.name.split(" ", 4)[0];
  // // var lastname = localUser.name.split(" ", 4)[2];
  
  // //console.log(name + ' ' + lastname);

  //const [name, , lastname] = localUser.name.split(" ");
  // const name = localUser.name.split(" ")[0];
  // let lastname = '';

  // if(name.length >= 3){
  //   lastname = localUser.name.split(" ")[2];
  // }else{
  //   lastname = localUser.name.split(" ")[1];
  // }

  //console.log(name + ' ' + lastname);

  const loginNavigate = () => {
    navigate('/login');
  }

  const registerNavigate = () => {
    navigate('/register');
  }

  return (
    <div style={
      {
        backgroundColor: '#722ed1',
        width: '100%',
        padding: '10px'
      }
    }>
      <Row>
        <Col xs={24}>
            <div style={
                {
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }
              }>

              <h1 className='title' style={{margin: '0', padding: '0'}}>
                To-Do List
              </h1>

              { user ? 
                (
                  <>
                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center'}}>
                      <h2 style={{color: 'white', fontSize: '20px', margin: '0'}}>
                        { localUser && <>Hola {localUser.name} {localUser.lastname}</>}
                        {/* {localUser && <>{name + ' ' + lastname}</>}  */}
                      </h2>
                      <Button onClick={logout} color='red' variant='solid' style={{fontWeight: 'bold'}}>Log Out</Button>
                    </div>
                  </>
                )
                : 
                (
                  <>
                    <div style={
                      {
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                      }
                    }>
                      <Button onClick={registerNavigate} style={{fontWeight: 'bold', backgroundColor: 'white'}} color='purple' variant='text'>Registrate</Button>
                      <Button onClick={loginNavigate} color="orange" variant="solid" style={{fontWeight: 'bold', margin: '0 0 0 1rem'}}>Log In</Button>
                    </div>
                  </>
                ) 
              }
            </div>
        </Col>
      </Row>
    </div>
  )
}
