import React from 'react';

const Header = (props) => {

  return (
    <div className="row justify-content-center">
      <div className='sticky-top mb-5'>
        <h1 className='title'>Spotisaab</h1>
          <h3 className='playlist-title'>{props.player && props.player.context.metadata.context_description}</h3>
        <p className='author text-muted'></p>
      </div>
    </div>
  )
}

export default Header;