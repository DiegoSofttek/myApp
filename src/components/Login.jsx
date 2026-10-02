import { Button, Col, Input, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {

    const {user} = useAuth();
    const navigate = useNavigate();

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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

    const login = async() => {
      try{
        await signInUser(userName, password);
      }catch(error){
        setError('Error al iniciar sesión');
      }
    }

  return (
    <div style={{ background: '#efefef', minHeight: '100vh' }}>
      <div
        style={{
          background: '#6f2bd9',
          color: '#fff',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1 className='title' style={{ margin: 0, color: '#fff', fontSize: '30px', fontWeight: 'bold' }}>To-Do List</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>Hola Diego Cruz</span>
          <Button color='red' variant='solid' style={{ fontWeight: 'bold' }}>Log Out</Button>
        </div>
      </div>

      <div className='card' style={{ margin: '32px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '32px', fontWeight: 'bold' }}>Lista de Tareas</h2>

        <Row gutter={[32, 32]} align='top'>
          <Col xs={24} lg={9}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #8a2be2',
                borderRadius: '14px',
                padding: '28px 38px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h2 style={{ textAlign: 'center', color: '#d99000', fontSize: '28px', fontWeight: 'bold', marginBottom: '36px' }}>
                Editar Tarea
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <label style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '62px' }}>Título:</label>
                <Input value='Video del proyecto' size='large' readOnly />
              </div>

              <Input.TextArea
                value='Tenemos que hacer el video del sistema funcionando y la documentación'
                rows={5}
                readOnly
                style={{ marginBottom: '28px', resize: 'none' }}
              />

              <Button
                block
                color='purple'
                variant='solid'
                style={{ fontWeight: 'bold', marginBottom: '12px', height: '38px' }}
              >
                Actualizar
              </Button>

              <Button
                block
                color='red'
                variant='solid'
                style={{ fontWeight: 'bold', height: '38px' }}
              >
                Cancelar
              </Button>
            </div>
          </Col>

          <Col xs={24} lg={15}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                {
                  title: 'Tarea de electronica',
                  description: 'Tenemos que comprar los materiales para la tarea de electronica',
                  email: 'juan@softtek.com',
                  date: '8 de marzo de 2025 a las 15:26',
                  edit: false
                },
                {
                  title: 'Video del proyecto',
                  description: 'Tenemos que hacer el video del sistema funcionando y la documentación',
                  email: 'diegoa.cruz@softtek.com',
                  date: '8 de marzo de 2025 a las 15:27',
                  edit: true
                },
                {
                  title: 'Tarea de administración',
                  description: 'Tenemos que realizar la investigación de la materia de administración',
                  email: 'juan@softtek.com',
                  date: '8 de marzo de 2025 a las 15:29',
                  edit: false
                }
              ].map((task) => (
                <div
                  key={task.title}
                  style={{
                    display: 'flex',
                    background: '#fff',
                    border: '1px solid #8a2be2',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ flex: 1, padding: '22px 20px' }}>
                    <div style={{ color: '#6f2bd9', fontSize: '26px', fontWeight: 'bold', marginBottom: '18px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '18px', marginBottom: '18px' }}>{task.description}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{task.email}</span>
                      <span style={{ fontSize: '16px', color: '#d99000', fontWeight: 'bold' }}>{task.date}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {task.edit && (
                      <div
                        style={{
                          width: '100px',
                          flex: 1,
                          minHeight: '86px',
                          background: '#10c400',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '28px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✎
                      </div>
                    )}
                    <div
                      style={{
                        width: '100px',
                        flex: 1,
                        minHeight: task.edit ? '86px' : '100%',
                        background: '#ff1616',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}
