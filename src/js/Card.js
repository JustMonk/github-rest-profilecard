import React from 'react';
import ReactDOM from 'react-dom';

import SearchForm from './SearchForm';
import UserProfile from './UserProfile';


class Card extends React.Component {
   constructor(props) {
      super(props);
      this.state = { isOpen: false };
      this.showUser = this.showUser.bind(this);
      this.currentUser;
      this.changeWrapperSize = this.changeWrapperSize.bind(this);
      this.closeProfile = this.closeProfile.bind(this);
   }

   componentDidMount() {
      document.getElementById('anim').style.height = document.querySelector('.search-wrapper').offsetHeight + 'px';
   }

   changeWrapperSize(height) {
      let wrap = document.getElementById('anim');
      wrap.style.height = `${height}px`;
   }

   showUser(data) {
      this.userData = data;
      this.setState({ isOpen: !this.state.isOpen });
   }

   closeProfile() {
      this.setState({isOpen: !this.state.isOpen});
   }

   render() {
      //default grid 12 10 8
      //mini grid (for search) 12 8 6

      return (
         <div className="wrapper row">

            <div className={!this.state.isOpen ? "col s12 m8 l6" : "col s12 m10 l8"}>
               <div className="card-wrapper card" id="anim">

                  {!this.state.isOpen ? <SearchForm showUser={this.showUser} resizeWrapper={this.changeWrapperSize} /> : <UserProfile close={this.closeProfile} userData={this.userData} resizeWrapper={this.changeWrapperSize}/>}

               </div>
            </div>
         </div>
      );

   }
}

export default Card;
