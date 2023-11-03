// This is NO LONGER acrude copy of ActivityLevelReport.jsx from the researcher view. I KIND OF know what I'm doing 
// - Brody

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Tag } from 'antd';
import './TeacherGradebook.less';
import { useSearchParam } from '../../../../../src/Utils/useSearchParam.jsx'; // added extra ../'s need a better fix
import NavBar from '../../../../components/NavBar/NavBar';
import { useSearchParams, useParams } from 'react-router-dom'


import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
} from '../../../../../src/Utils/requests'; // TODO: same ../ change here, god.
import Form from 'antd/lib/form/Form';


// creating a new component modeled after Roster.jsx
export default function TeacherGradebook( { classroomId } ) {
  // these are the state variables we need access to
  const [classroom, setClassroom] = useState({});
  const [activities, setActivities] = useState([]); // this is an array, so we do the [] thing
  const [activeLessonModule, setActiveLessonModule] = useState(null); // TODO: not sure if this is needed beyond getting activities, could be const?


  useEffect(() => {
    // get the classroom from our input id
    getClassroom(classroomId).then((res) => {
      if (res.data) {
        const classroom = res.data;
        setClassroom(classroom);
        // get list of assignments (taken from Home.jsx's approach)
        classroom.selections.forEach(async (selection) => {
          if (selection.current) {
            const lsRes = await getLessonModule(
              selection.lesson_module
            );
            if (lsRes.data) setActiveLessonModule(lsRes.data);
            else {
              message.error(lsRes.err);
            }
            const activityRes = await getLessonModuleActivities(lsRes.data.id);
            if (activityRes) setActivities(activityRes.data);
            else {
              message.error(activityRes.err);
            }
          }
        });
      } else {
        message.error(res.err);
      }
    });

    }, [classroomId]);

  return (
    <div>
      <h1>Classroom id: {classroomId}</h1>
      <h2>Students in the Classroom:</h2>
      <ul>
        {classroom.students &&
          classroom.students.map((student, index) => (
            <li key={index}>{student.name}</li>
          ))}
      </ul>
    <h2>Activities in the Classroom:</h2>
    <ul>
      {activities && 
        activities.map((activity, index) => (
          <li key={index}>{activity.number}</li>
        ))}
    </ul>
    </div>
  );
}