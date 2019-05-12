import React from 'react';
import ReactDOM from 'react-dom';
import { arrayExpression, throwStatement } from '@babel/types';
import colors from './colors';

class UserProfile extends React.Component {
   constructor(props) {
      super(props);
      this.userData = this.props.userData;

      this.languageList = {};

      //пока не используется, будет подгружаться на вкладке stats
      this.languageStats = {
         owned: {},
         forked: {}
      };

      //state
      this.state = { userRepos: [], languageList: [], favoriteLang: null };
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

   }

   componentDidUpdate() {
      this.props.resizeWrapper(document.querySelector('#expand').offsetHeight);
   }

   getAllRepos(req = `${this.userData.repos_url}?type="owner"&sort="created"&per_page=999`) {
      //TODO: отрефакторить извлечение ссылки на страницу
      //лучше всего просто запросить номер последней наример 3 и инкрементить, если последняя завершить

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
            console.log(`состояние обновлено. размер: ${this.state.userRepos.length}`);
            console.log(this.state.userRepos);
            if (page.next) {
               console.log(`вызван next`);
               this.getAllRepos(page.next);
            } else {
               console.log(`все репо загружены`);
               //TODO тут надо событие генерировать reposLoaded
               //а на него уже подписать createTable и languageStats
               this.createReposTable();
               this.createLangList();
            }
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

      //фаворитку можно через геттер описать
      let langArr = Object.keys(langList);
      langArr.sort((a, b) => {
         return langList[a] > langList[b] ? -1 : 1;
      });

      this.setState({ favoriteLang: langArr[0], languageList: langArr });
   }

   createReposTable() {
      //TIPS: можно писать их в таблицу асинхронно по мере получения
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

      //ресайзим после наполнения таблицы, чтобы избежать затупа
      this.props.resizeWrapper(document.querySelector('#expand').offsetHeight);
      document.querySelector('#table-loader').remove();

   }

   render() {

      return (
         <div className="expand-form fade" id="expand">

            <div className="card-header grey lighten-4">
               <div className="controls">
                  <div className="close-button">
                     <a href="#" title="Return to search" onClick={this.props.close}><i class="fas fa-arrow-left fa-2x"></i></a>
                  </div>

                  <div className="github-button">
                     <a target="_blank" href={this.userData.html_url} title="Open on github"><i class="fab fa-github fa-2x"></i></a>
                  </div>
               </div>
            </div>


            <div className="card-content">
               <div className="user-info-wrapper">
                  <div className="left-side">
                     <div className="user-avatar">
                        <img src={this.userData.avatar_url}></img>
                        <h1>gg</h1>
                     </div>
                     <div>Open on github</div>

                  </div>

                  <div className="user-data">
                     <h1>{this.userData.name}</h1>
                     <h2>@{this.userData.login} (id {this.userData.id})</h2>
                     <h3>{this.userData.bio}</h3>
                     <h3><i class="fas fa-map-marker-alt"></i> {this.userData.location}</h3>
                     <h3>Favorite language: {!this.state.favoriteLang ? "just wait" :
                        <span className="lang-wrapper">
                           <span className="repo-language-color" style={{ backgroundColor: colors[this.state.favoriteLang].color }}></span>
                           <span>{this.state.favoriteLang}</span>
                        </span>}
                     </h3>
                  </div>

               </div>

               <div class="row tab-row">
                  <div class="col s12">
                     <ul class="tabs">
                        <li class="tab col s6"><a class="active" href="#test1">User info</a></li>
                        <li class="tab col s6"><a href="#test2">Repos ({this.userData.public_repos})</a></li>
                        <li style={{ display: 'none' }} class="tab col s3"><a href="#test3">Stars</a></li>
                        <li style={{ display: 'none' }} class="tab col s3"><a href="#test4">Statistics</a></li>
                     </ul>
                  </div>
                  <div id="test1" class="col s12">

                     <div class="row section card-content">
                        <div class="col s6">
                           <h5 style={{ margin: "10px 0" }}>Followers</h5>
                           <div>Followers: {this.userData.followers}</div>
                           <div>Following: {this.userData.following}</div>
                        </div>
                        <div class="col s6">
                           <h5 style={{ margin: "10px 0" }}>Languages</h5>
                           <div>Used languages:
                           {this.state.languageList.map(val => {
                              return (
                                 <span className="lang-wrapper">
                                    <span className="repo-language-color" style={{ backgroundColor: colors[val].color }}></span>
                                    <span>{val}</span>
                                 </span>
                              )
                           })}
                           </div>
                        </div>
                     </div>

                     <div class="divider"></div>

                     <div className="row section card-content">
                        <div class="col s6">
                           <h5 style={{ margin: "10px 0" }}>Created</h5>
                           <div><i class="fas fa-plus-circle"></i> Created: {this.userData.created_at}</div>
                           <div><i class="fas fa-sync-alt"></i> Last update: {this.userData.updated_at}</div>
                        </div>
                        <div class="col s6">
                           <h5 style={{ margin: "10px 0" }}>User links</h5>
                           <div><i class="fas fa-link"></i> <a href={this.userData.blog}>{this.userData.blog}</a></div>
                        </div>
                     </div>

                  </div>

                  <div id="test2" class="col s12 card-content">

                     <table id="repos-table">
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

                     <div id="table-loader" class="progress" style={{ margin: '15px 0' }}>
                        <div class="indeterminate"></div>
                     </div>

                  </div>

                  <div id="test3" class="col s12">Test 3</div>
                  <div id="test4" class="col s12">Test 4</div>
               </div>
            </div>


         </div>
      );
   }
}

export default UserProfile;