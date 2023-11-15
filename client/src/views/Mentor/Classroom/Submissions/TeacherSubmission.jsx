// This is NO LONGER acrude copy of ActivityLevelReport.jsx from the researcher view. I KIND OF know what I'm doing 
// - Brody

import React, { useEffect, useState } from 'react';
import { Table, Select, Tag, Input, message } from 'antd';
import './TeacherSubmission.less'


import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
  getSession,
  getStudent,
} from '../../../../../src/Utils/requests'; // TODO: so many ../ 



// creating a new component modeled after Roster.jsx
export default function TeacherSubmission( { classroomId } ) {
  // these are the state variables we need access to
  const [classroom, setClassroom] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]); // this is an array, so we do the [] thing
  const [students, setStudents] = useState([]);
  const [activeLessonModule, setActiveLessonModule] = useState(null); // TODO: not sure if this is needed beyond getting activities, could be const?

  // useEffect will get us all our necessary state variables methinks
  useEffect(() => {
    // get the classroom from our input id
    getClassroom(classroomId).then((res) => {
      if (res.data) {
        const classroom = res.data;
        setClassroom(classroom);
        // students is grabbed too
        setStudents(classroom.students);
        // get list of assignments (taken from Home.jsx's approach)
        setSubmissions(classroom.submissions);
      } else {
        message.error(res.err);
      }
    });
    }, [classroomId]);

    // for the back button!
    const handleBack = () => {
      navigate('/dashboard');
    };



    return (
      <div>
      <button id='home-back-btn' onClick={handleBack}>
        <i className='fa fa-arrow-left' aria-hidden='true' />
      </button>

      <div className="submission-menu">
        <Select defaultValue="Student" className='section'>
          {/* Dropdown menu for Student section */}
          {students.map((student) => (
            <Option key={student.id} value={student.name}/>
          ))}
          {/* Add other options related to students if needed */}
        </Select>

        <Select defaultValue="Activity" className="section">
          {/* Dropdown menu for Activity section */}
          {...activities.map((activity) => (
            <Option value={"Level" + activity.number}/>
          ))}

          {/* Add other options related to students if needed */}
        </Select>

        <Select defaultValue="Class" className="section">
          {/* Dropdown menu for Class section */}
            <Option key ={classroomId} value={classroomId}/>
          {/* Add other options related to class if needed */}
        </Select>
      </div>
    </div>
    );
}