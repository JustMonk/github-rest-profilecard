import React from 'react';
import ReactDOM from 'react-dom';
import { arrayExpression, throwStatement } from '@babel/types';
import colors from './colors';
import Chart from 'chart.js';

class UserProfile extends React.Component {
   constructor(props) {
      super(props);
      this.userData = this.props.userData;

      this.state = { userRepos: [], languageList: [], favoriteLang: null, loadChard: false };
   }

   componentDidMount() {
      var instance = M.Tabs.init(document.querySelector('.tabs'), {});

      this.getAllRepos();

      this.props.resizeWrapper(document.querySelector('#expand').offsetHeight);

      document.querySelector('.tabs').addEventListener('click', (e) => {
         //resize wrapper for tab height
         if (e.target.tagName != 'A') return;
         this.props.resizeWrapper(document.querySelector('#expand').offsetHeight);
      });

      this.getUserOrgs();
   }

   componentDidUpdate() {
      this.props.resizeWrapper(document.querySelector('#expand').offsetHeight);
   }

   getUserOrgs() {
      fetch(this.userData.organizations_url, {
         method: "GET"
      })
         .then(response => {
            return response.json();
         })
         .then(orgs => {
            this.setState({ userOrgs: orgs });
         });
   }

   getAllRepos(req = `${this.userData.repos_url}?type="owner"&sort="created"&per_page=999`) {
      fetch(req, {
         method: "GET"
      })
         .then(response => {
            return response.json().then(data => {
               let page = {
                  repos: data
               };

               if (!response.headers.has('link')) return page;

               if (response.headers.get('link').includes('next')) {
                  response.headers.get('link').split(',').forEach(val => {
                     if (val.includes('next')) page.next = val.trim().slice(1, -13);
                  });
               }
               return page;
            });
         })
         .then(page => {
            this.setState({ userRepos: this.state.userRepos.concat(page.repos) });
            if (page.next) {
               this.getAllRepos(page.next);
            } else {
               this.createReposTable();
               this.createLangList();
            }
         });
   }

   createChart(langList, header, chartId) {
      var data = {
         labels: Object.keys(langList),
         datasets: [{
            label: header,
            backgroundColor: Object.keys(langList).map(val => {
               return colors[val].color;
            }),
            borderColor: "rgba(101, 101, 101, 0.4);",
            borderWidth: 2,
            hoverBackgroundColor: "rgba(255,99,132,0.4)",
            hoverBorderColor: "rgba(255,99,132,1)",
            data: Object.values(langList),
         }]
      };

      var options = {
         maintainAspectRatio: false,
         scales: {
            yAxes: [{
               stacked: true,
               gridLines: {
                  display: true,
                  color: "rgba(255,99,132,0.2)"
               }
            }],
            xAxes: [{
               gridLines: {
                  display: false
               }
            }]
         }
      };

      Chart.Bar(chartId, {
         options: options,
         data: data
      });

   }

   createLangList() {
      let langList = {};

      this.state.userRepos.forEach(val => {
         if (!val.language) return;
         if (val.language in langList) {
            langList[val.language] += 1;
         } else {
            langList[val.language] = 1;
         }
      });

      let langArr = Object.keys(langList);
      langArr.sort((a, b) => {
         return langList[a] > langList[b] ? -1 : 1;
      });

      if (!langArr.length) {
         langArr.push('No one language used');
      }

      this.setState({ favoriteLang: langArr[0], languageList: langArr });

      //chart by lang count
      this.createChart(langList, 'Repos count by language', 'reposCountChart');
   }

   createReposTable() {

      let reposTable = document.querySelector('#repos-table tbody');
      this.state.userRepos.forEach(val => {
         let row = document.createElement('tr');
         row.innerHTML = `
         <td>${val.created_at.slice(0, -10)}</td>
         <td><a target="_blank" href="${val.html_url}">${val.fork ? '<i class="fas fa-code-branch"></i>' : ''} ${val.name}</a></td>
         <td>${val.language}</td>
         <td>${val.updated_at.slice(0, -10)}</td>
         <td>${val.stargazers_count}</td>
         `;
         reposTable.append(row);
      });

      //resize after table filled
      this.props.resizeWrapper(document.querySelector('#expand').offsetHeight);
      document.querySelector('#table-loader').remove();

   }

   render() {

      return (
         <div className="expand-form fade" id="expand">

            <div className="card-header grey lighten-4">
               <div className="controls">
                  <div className="close-button">
                     <a href="#" title="Return to search" onClick={this.props.close}><i className="fas fa-arrow-left fa-2x"></i></a>
                  </div>

                  <div className="github-button">
                     <a target="_blank" href={this.userData.html_url} title="Open on github"><i className="fab fa-github fa-2x"></i></a>
                  </div>
               </div>
            </div>


            <div className="card-content">
               <div className="user-info-wrapper">
                  <div className="left-side">
                     <div className="user-avatar">
                        <img src={this.userData.avatar_url}></img>
                     </div>
                  </div>

                  <div className="user-data">
                     <h1>{this.userData.name}</h1>
                     <h2>@{this.userData.login} (id {this.userData.id})</h2>
                     <h3>{this.userData.bio}</h3>
                     {this.userData.location ? <h3><i className="fas fa-map-marker-alt"></i> {this.userData.location}</h3> : ""}
                     <h3>Favorite language: {!this.state.favoriteLang ? <div className="progress">
                        <div className="indeterminate"></div>
                     </div> :
                        <span className="lang-wrapper">
                           <span className="repo-language-color" style={{ backgroundColor: colors[this.state.favoriteLang].color }}></span>
                           <span>{this.state.favoriteLang}</span>
                        </span>}
                     </h3>
                  </div>

               </div>

               <div className="row tab-row" style={{ marginBottom: 0 }}>
                  <div className="col s12">
                     <ul className="tabs">
                        <li className="tab col s3"><a className="active" href="#tab1">User info</a></li>
                        <li className="tab col s3"><a href="#tab2">Repos ({this.userData.public_repos})</a></li>
                        <li className="tab col s3"><a href="#tab3">Stats</a></li>
                        <li className="tab col s3"><a href="#tab4">Organizations {!this.state.userOrgs ? "" : `(${this.state.userOrgs.length})`}</a></li>
                     </ul>
                  </div>
                  <div id="tab1" className="col s12">

                     <div className="row section card-content">
                        <div className="col s6">
                           <h5 style={{ margin: "10px 0" }}>Followers</h5>
                           <div>Followers: {this.userData.followers}</div>
                           <div>Following: {this.userData.following}</div>
                        </div>
                        <div className="col s6">
                           <h5 style={{ margin: "10px 0" }}>Used languages</h5>

                           {!this.state.languageList.length ?
                              <div className="progress">
                                 <div className="indeterminate"></div>
                              </div>
                              :
                              <div>
                                 {this.state.languageList.map((val, i) => {
                                    return (
                                       <span className="lang-wrapper" key={i}>
                                          <span className="repo-language-color" style={{ backgroundColor: colors[val] ? colors[val].color : colors['empty'].color }}></span>
                                          <span>{val}</span>
                                       </span>
                                    )
                                 })}
                              </div>}

                        </div>
                     </div>

                     <div className="divider"></div>

                     <div className="row section card-content">
                        <div className="col s6">
                           <h5 style={{ margin: "10px 0" }}>Joined</h5>
                           <div><i className="fas fa-plus-circle"></i> Created: {this.userData.created_at.slice(0, -10)}</div>
                           <div><i className="fas fa-sync-alt"></i> Last update: {this.userData.updated_at.slice(0, -10)}</div>
                        </div>
                        <div className="col s6">
                           <h5 style={{ margin: "10px 0" }}>User links</h5>
                           <div><i className="fas fa-link"></i> {!this.userData.blog ? "user have no links" : <a href={this.userData.blog}>{this.userData.blog.split('//').slice(1).join('')}</a>} </div>
                        </div>
                     </div>

                  </div>

                  <div id="tab2" className="col s12 card-content">

                     <table id="repos-table" class="responsive-table">
                        <thead>
                           <tr>
                              <th>Created date</th>
                              <th>Name</th>
                              <th>Lang</th>
                              <th>Last update</th>
                              <th>Stars</th>
                           </tr>
                        </thead>

                        <tbody>
                        </tbody>
                     </table>

                     <div id="table-loader" className="progress" style={{ margin: '15px 0' }}>
                        <div className="indeterminate"></div>
                     </div>

                  </div>

                  <div id="tab3" className="col s12 card-content">
                     {!this.state.languageList.length ?
                        <div className="progress">
                           <div className="indeterminate"></div>
                        </div>
                        :
                        <div className="chart-container">
                           <canvas id="reposCountChart"></canvas>
                        </div>
                     }

                  </div>

                  <div id="tab4" className="col s12 card-content">
                     <div className="row" style={{ marginBottom: 0 }}>

                        {!this.state.userOrgs ?
                           <div className="progress">
                              <div className="indeterminate"></div>
                           </div>
                           :
                           (!this.state.userOrgs.length ?
                              <h5>Organizations list is empty</h5>
                              :
                              this.state.userOrgs.map((val, i) => {
                                 return (<div className="col s12 m6 l4" key={i}>
                                    <div className="card-panel org-card">
                                       <div className="org-avatar">
                                          <img src={val.avatar_url}></img>
                                       </div>
                                       <a target="_blank" href={`https://github.com/${val.login}`}>{val.login}</a>
                                       <div className="limiter"></div>
                                    </div>
                                 </div>)
                              })
                           )
                        }

                     </div>
                  </div>

               </div>
            </div>

         </div>
      );
   }
}

export default UserProfile;