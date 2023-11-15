// This is NO LONGER acrude copy of ActivityLevelReport.jsx from the researcher view. I KIND OF know what I'm doing 
// - Brody

import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, message } from 'antd';
import './TeacherSubmission.less'


import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
  getSession,
} from '../../../../../src/Utils/requests'; // TODO: so many ../ 



// creating a new component modeled after Roster.jsx
export default function TeacherGradebook( { classroomId } ) {
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

    // for the button of "Add Feedback"
    const AddFeedback = () =>{

    }



    return (
      <div>
        
        <button id='home-back-btn' onClick={handleBack}>
          <i className='fa fa-arrow-left' aria-hidden='true' />
        </button>
        
        <div className="submission-menu">
        <div className="section section1">Section 1</div>
        <div className="section section2">Section 2</div>
        <div className="section section3">Section 3</div>
      </div> 
      
      
      <div className="top-bar" style={{ marginTop: '200px'}}>
        <button> 
          <div className="top-bar AddFeedback">Add Feedback</div>
        </button>

        <button onClick={AddFeedback}> 
          <div className="top-bar Grade">Grades</div>
        </button>
      </div>
      
      <div className="Student-submission" style={{ marginTop: '20px', marginBottom: '50px' }}></div>
      
      </div>
    );
}