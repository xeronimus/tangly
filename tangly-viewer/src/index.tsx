import 'normalize.css';
import ReactDOM from 'react-dom/client';
import {App} from './App';
import {ProjectGraphData} from './types';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

declare global {
  interface Window {
    TANGLY_DATA?: ProjectGraphData;
  }
}

getProjectGraphData()
  .then((graphData: ProjectGraphData) => {
    root.render(<App data={graphData} />);
  })
  .catch((error) => {
    console.error('Failed to load graph data:', error);
    root.render(
      <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
        <h1>Error Loading Data</h1>
        <p>Failed to load project graph data. Please ensure data.json is available or data is embedded.</p>
        <p style={{color: '#999', fontSize: '14px'}}>Error: {error.message}</p>
      </div>
    );
  });

async function getProjectGraphData(): Promise<ProjectGraphData> {
  if (window.TANGLY_DATA) {
    return window.TANGLY_DATA;
  } else {
    return fetch('/graph.json').then((response) => response.json());
  }
}
