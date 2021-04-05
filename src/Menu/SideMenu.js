import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';

export default function SideMenu() {

  return (
    <Col className="sidebar-wrapper">
      <Nav className="sidebar">
        <div className="sidebar-sticky">Menu</div>
      </Nav>
    </Col>
  )
}