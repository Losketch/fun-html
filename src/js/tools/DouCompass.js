const hand = document.getElementById('hand');
const framePath = document.getElementById('framePath');
const handPath = document.getElementById('handPath');
const togglePathButton = document.getElementById('togglePathButton');

window.addEventListener('deviceorientationabsolute', (ev) => {
  document.body.style.setProperty('--deg', ev.alpha + 90 + 'deg');
});

let isNewPath = false;

const originalFramePath =
  'M1 1v948h63V312h241V1Zm383 0v312h250v548c0 16-5 21-22 22s-75 2-134-1c10 18 21 48 24 66 77 0 128-1 158-11 29-11 39-32 39-75V1ZM64 54h181v74H64Zm381 0h189v74H445ZM64 177h181v82H64Zm381 0h189v83H445Z';
const newFramePath =
  'm646 1-29 37H447l-57-27v340h8c23 0 45-12 45-17v-24h183v549c0 15-5 21-24 21-22 0-133-8-133-8v13c46 7 74 14 89 24 14 8 21 23 24 41 90-9 100-40 100-84V65c9-3 12-6 17-13zM253 5l-30 33H60L1 9v941h9c27 0 45-14 45-23V310h176v46h8c18 0 45-13 46-18V70c14-3 26-9 31-15zM55 62h176v97H55Zm388 0h183v97H443ZM55 184h176v100H55Zm388 0h183v100H443Z';
const originalHandPath = 'M 0,0 H 500 V 500 H 0 Z';
const newHandPath = 'M 184,500 262,197 H 500 V 2 H 245 L 0,0 Z';

togglePathButton.addEventListener('click', () => {
  framePath.setAttribute('d', isNewPath ? originalFramePath : newFramePath);
  handPath.setAttribute('d', isNewPath ? originalHandPath : newHandPath);

  hand.style.height = isNewPath ? '25px' : '13px';
  hand.style.width = isNewPath ? '114.514px' : '100px';
  hand.style.left = isNewPath ? '58.486px' : '73px';
  hand.style.top = isNewPath ? '251px' : '257px';

  isNewPath = !isNewPath;
});
