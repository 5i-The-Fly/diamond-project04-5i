// This component, when clicked, presents a popup that allows the user to create a (template) rubric that will be applied
// to the assignment the button exists under. -Brody

import React, { useState } from 'react';
import './RubricCreationPopup.css';
import {
    updateTemplateRubric,
  } from '../../../../../src/Utils/requests'; // This one sucks and wont work and I can't figure out why.

const RubricCreationPopup = (assignmentKey) => {
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [rubric, setRubric] = useState([{ description: '', points: '' }]);

  // This button makes the popup visible.
  const handleButtonClick = () => {
    setPopupVisibility(true);
  };

  // Adds a criteria to the rubric.
  const handleAddCriteria = () => {
    setRubric([...rubric, { description: '', points: '' }]);
  };
  // This is the handler for when the description is changed.
  const handleDescriptionChange = (index, value) => {
    const updatedRubric = [...rubric];
    updatedRubric[index].description = value;
    setRubric(updatedRubric);
  };
  // This is the handler for when the points are changed.
  const handlePointsChange = (index, value) => {
    const updatedRubric = [...rubric];
    updatedRubric[index].points = value;
    setRubric(updatedRubric);
  };

  // This is all the popup stuff, it will only be rendered when the button has been pressed.
  const renderRubricForm = () => (
    <div className="popup">
      <h2>Rubric</h2>

      {rubric.map((criteria, index) => (
        <div key={index}>
          <label>Description:</label>
          <input
            type="text"
            value={criteria.description}
            onChange={(e) => handleDescriptionChange(index, e.target.value)}
          />
          
          <label>Points:</label>
          <input
            type="text"
            value={criteria.points}
            onChange={(e) => handlePointsChange(index, e.target.value)}
          />
        </div>
      ))}

      <button onClick={handleAddCriteria}>Add Criteria</button>
      <button onClick={handleSave}>Save</button>
    </div>
  );

  const handleSave = () => {
    // TODO: How do we save to backend?? I am so lost.
    // TODO: We need to get the assignment index
    console.log('Rubric saved:', rubric);
    updateTemplateRubric(rubric, assignmentKey)
    setPopupVisibility(false);
  };
  // This is the button that will be rendered on the page.
  return (
    <div>
      <button onClick={handleButtonClick}>Open Rubric Creation Popup</button>
      {isPopupVisible && renderRubricForm()}
    </div>
  );
};

export default RubricCreationPopup;
