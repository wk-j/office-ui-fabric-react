import * as React from 'react';
import './Header.css';

export interface IHeaderProps {
  title: string;
  sideLinks: { name: string, url: string }[]
}

export default class Header extends React.Component<IHeaderProps, any> {

  public render() {
    let { title, sideLinks } = this.props;

    return (
      <div className='Header'>
        <div className='Header-title ms-font-xl ms-fontColor-white'>
          <i className='ms-Icon ms-Icon--classroom' />
          { title }
        </div>
        <div className='Header-buttons'>
          { sideLinks.map(link => (
            <a className='Header-button ms-fontColor-white' href={ link.url }>{ link.name }</a>
          )) }
        </div>
      </div>
    );
  }

}
