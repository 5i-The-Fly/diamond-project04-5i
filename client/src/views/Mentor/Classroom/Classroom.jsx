import {React, useEffect} from 'react';
import { Tabs } from 'antd';
import './Classroom.less';

import NavBar from '../../../components/NavBar/NavBar';
import Roster from './Roster/Roster';
import Home from './Home/Home';
import TeacherGradebook from './Gradebook/TeacherGradebook'; // Brody : Not sure if 'TeacherGradebook' is the best name...
import TeacherSubmission from './Submissions/TeacherSubmission';
import SavedWorkSpaceTab from '../../../components/Tabs/SavedWorkspaceTab';
import { useSearchParams, useParams } from 'react-router-dom';

const { TabPane } = Tabs;

export default function Classroom({
  handleLogout,
  selectedActivity,
  setSelectedActivity,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { id } = useParams();
  const tab = searchParams.get('tab');
  const viewing = searchParams.get('viewing');

  useEffect(() => {
    sessionStorage.setItem('classroomId', id);

  }, [id]);

  return (
    <div className='container nav-padding'>
      <NavBar isMentor={true} />
      <Tabs
        defaultActiveKey={tab ? tab : 'home'}
        onChange={(key) => setSearchParams({ tab: key })}
      >
        <TabPane tab='Home' key='home'>
          <Home
            classroomId={parseInt(id)}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
            viewing={viewing}
          />
        </TabPane>

        <TabPane tab='Roster' key='roster'>
          <Roster handleLogout={handleLogout} classroomId={id} />
        </TabPane>
        <TabPane tab='Saved Workspaces' key='workspace'>
          <SavedWorkSpaceTab
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            classroomId={id}
          />
        </TabPane>
        // Brody
        // --------
        // Made a copy of the home tab, renamed it to gradebook. Looks like these tab components just swap to a given page
        // The key shows up in the url, don't know what it does otherwise. Things don't break when I change it, but best to make it
        // match the component name.
        <TabPane tab='Gradebook' key='teacherGradebook'>
          <TeacherGradebook
          classroomId={id}
        />
        </TabPane>
        <TabPane tab='Submissions' key='submissions'>
          <TeacherSubmission
          classroomId={id}
        />
        </TabPane>
      </Tabs>
    </div>
  );
}
