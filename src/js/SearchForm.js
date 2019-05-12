import React from 'react';
import ReactDOM from 'react-dom';

class SearchForm extends React.Component {
   constructor(props) {
      super(props);
      this.state = { isLoad: false };
      this.findUser = this.findUser.bind(this);
   }

   componentDidMount() {
      this.props.resizeWrapper(document.querySelector('.search-wrapper').offsetHeight);
   }

   componentDidUpdate() {
      this.props.resizeWrapper(document.querySelector('.search-wrapper').offsetHeight);
   }

   findUser(e) {
      e.preventDefault();

      //show overlay
      this.setState({ isLoad: true });

      let username = document.forms['search-user'].elements['username'].value;

      fetch(`https://api.github.com/users/${username}`, {
         method: 'GET'
      })
         .then((result) => {
            if (result.status != 200) throw new Error('user not found');
            return result.json();
         })
         .then(userData => {
            this.props.showUser(userData);
         })
         .catch(e => {
            console.log(e.message);
            this.setState({ error: `User ${username} dont exist` });
            this.setState({ isLoad: false });
         });
   }

   render() {

      return (
         <div className="search-wrapper">

            {this.state.isLoad ? <div className="overlay">
               <div class="preloader-wrapper small active">
                  <div class="spinner-layer spinner-red-only">
                     <div class="circle-clipper left">
                        <div class="circle"></div>
                     </div><div class="gap-patch">
                        <div class="circle"></div>
                     </div><div class="circle-clipper right">
                        <div class="circle"></div>
                     </div>
                  </div>
               </div>
            </div> : ""}

            <div className="card-content">
               <span className="card-title">Find profile</span>
               <div class="form-wrapper">
                  <form id="search-user" onSubmit={this.findUser}>
                     <div class="search-input">
                        <div class="input-field col s12">
                           <i class="prefix material-icons prefix fab fa-github"></i>
                           <input placeholder="Enter username" id="username" type="text" />
                           {this.state.error ? <span class="helper-text error-message">{this.state.error}</span> : ""}
                        </div>
                        <a class="waves-effect waves-light btn-small" onClick={this.findUser}>Search</a>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      );
   }
}

export default SearchForm;