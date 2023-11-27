// Student Submission view for teachers.
//-------------------------------------------------------------------------------------------------
// Observable Functions : student comment section + student submission section:

// By selecting the a specific assignment from each student,
// 1. student comment section 
// If students left comment want to let the teacher know, their comment will be shown in the Student-comment container 

// 2. student submission section:
// their submission will shown in the Student-submission container 

// Hidden Functions: Add feedback + Show Rubric
// button 1: Add feedback
// When teacher click the button "Add feedback" on the left hand side in the submission bar
// A typable and editable dialog box pops up where the teacher can enter feedback, save it and send it to the student.

// button 2: Show Rubric
// When teacher click the button "Show Rubric" on the right hand side in the submission bar
// It might trigger the display of a rubric associated with the assignment or task.
// The rubric could include criteria for assessment, 
// grading guidelines,
// scores or feedback for each criterion.

//-------------------------------------------------------------------------------------------------
// TODO:
// [ ] show student comment and submission after selecting student and specific assignment.
// [ ] "Add feedback" Button 
//    [ ] making a typable and editable dialog box 
//        [ ] send feedback button
//        [ ] attach file icon
// [ ] "Show Rubric" Button 
//    [ ] Thinking about what criteria should be included
//    [ ] Make criteria Tabularization through categorization 
//    [ ] Looking at the rubric gives teacher an idea of the student's specific score
// 

//-------------------------------------------------------------------------------------------------

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

      <div className="comment-bar" style={{ marginTop: '100px' }}>
        <span className="comment-text">Student Comment </span>
      </div>
      <div className='Student-comment' style={{ marginTop: '00px', marginBottom: '50px' }}></div>
      

      <div className="top-bar" style={{ marginTop: '50px', display: 'flex', flexDirection:"row" }}>
        <button style={{ marginTop: '10px', marginLeft:'30px'}}> 
          <div className="feedback-button">
            <span className="feedback-text">Add Feedback </span>
          </div>
        </button>

        <button style={{ marginTop: '10px', marginRight: '30px' }}>
          <div className='Rubric-button'>
            <span className='Rubric-text'> Show Rubric</span>
          </div>
        </button>
      </div>

      <div className="Student-submission" style={{ marginTop: '0px', marginBottom: '50px' }}></div>


    </div>
    );
}