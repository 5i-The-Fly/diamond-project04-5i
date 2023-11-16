import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Input, Menu, message } from "antd";
import { UserOutlined } from '@ant-design/icons';

export default function CellButton ( { student, activity, submissions, onScoreChange } ) {

    // Text to be displayed when the student has no submission for the activity.
    const noSubmissionValue = "-"
    const ungradedValue = "Grade Pending"
    // Local state to store the edited score
    const [editedScore, setEditedScore] = useState(90); // default score of 90 for now
    // Local state to track edit mode for this cell
    const [isCellEditMode, setIsCellEditMode] = useState(false);


    // Toggle edit mode for the cell
    const toggleCellEditMode = () => {
        setIsCellEditMode(!isCellEditMode);
    };


    useEffect(() => {
        // If submissions array is valid and has elements, update the edited score
        if (Array.isArray(submissions) && submissions.length > 0) {
            // TODO: For each submission, get its scored rubric, and determine the maximum scored submission
            setEditedScore(submissions[0].score); // Example: get the score from the first submission
        }
    }, [submissions]);

    // Modify getDisplayScore to use editedScore
    function getDisplayScore() {
        return editedScore;
    }


    // Function to handle score change and exit edit mode
    const handleScoreSave = (e) => {
        if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
            setIsCellEditMode(false);
            if (onScoreChange) {
                onScoreChange(student, activity, editedScore);
            }
        }
    };

    function dynamicColoring() {
        let score = getDisplayScore()
        if (score === noSubmissionValue) {
            return 'gray';
        }
        else if (score >= 95) {
            return '#008000'; // Dark Green
        } else if (score >= 90 && score < 95) {
            return '#32CD32'; // Lime Green
        } else if (score >= 80 && score < 90) {
            return '#90EE90'; // Light Green
        } else if (score >= 70 && score < 80) {
            return '#FFBF00'; // Amber
        } else if (score >= 60 && score < 70) {
            return '#FFA500'; // Orange
        } else if (score === 0) {
            return 'grey'; // Grey for ungraded
        } else {
            return 'red'; // Red for all other scores
        }
    }

    // Dropdown options for the button
    const items = [
    {
        label: 'Change grade',
        key: '1',
        icon: <UserOutlined />,
        onClick: toggleCellEditMode
    },
    {
        label: 'View submission',
        key: '2',
        icon: <UserOutlined />,
    },
    {
        label: '3rd menu item',
        key: '3',
        icon: <UserOutlined />,
        danger: true,
    },
    {
        label: '4th menu item',
        key: '4',
        icon: <UserOutlined />,
        danger: true,
        disabled: true,
    },
    ];


    const handleMenuButtonClick = (e) => {
        message.info('Click on menu button.');
        console.log('click menu button', e);
    };


    if (isCellEditMode) {
    return (
        <Input
            type="number"
            value={editedScore}
            onChange={(e) => setEditedScore(Number(e.target.value))}
            onBlur={handleScoreSave}
            onKeyDown={handleScoreSave}
            autoFocus
        />
    );
    } else {
        // Define the dropdown menu
        const dropdownMenu = (
            <Menu onClick={handleMenuButtonClick}>
                {items.map(item => (
                    <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                        {item.label}
                    </Menu.Item>
                ))}
            </Menu>
        );

        return (
            <Dropdown overlay={dropdownMenu} trigger={['click']}>
                <Button style={{ backgroundColor: dynamicColoring() }}>
                    {getDisplayScore()}
                </Button>
            </Dropdown>
        );
    }
}
