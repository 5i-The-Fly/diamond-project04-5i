import { Button, Dropdown } from "antd";
import { DownOutlined, UserOutlined } from '@ant-design/icons';

export default function CellButton ( { student, activity, submissions} ) {

    // Text to be displayed when the student has no submission for the activity.
    const noSubmissionValue = "-"
    const ungradedValue = "Grade Pending"
    // Text to display in the main part of the button. The student's current grade for that assignment.
    function getDisplayScore()  {
    // TODO: change this from a ternary to a try-catch
    // TODO: allow teachers to choose which submission is used.
    // TODO: doesn't a submission need to be scored before it's displayed...? needs a submitted/ungraded
    //return submissions.length === 0 ? noSubmissionValue : 90
    return 90
    }

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
        label: '4rd menu item',
        key: '4',
        icon: <UserOutlined />,
        danger: true,
        disabled: true,
    },
    ];

    const handleMainButtonClick = (e) => {
        message.info('Click on left button.');
        console.log('click left button', e);
    };

    const handleMenuButtonClick = (e) => {
        message.info('Click on menu button.');
        console.log('click menu button', e);
    };

    const menuProps = {
        items,
        onClick: handleMenuButtonClick,
    };


    const buttonsRender = ([leftButton, rightButton]) => [
        <Button style={{backgroundColor: dynamicColoring()}}>
            {getDisplayScore()}
        </Button>,
        rightButton
    ]

    return (
    <div>
        <Dropdown.Button
        menu={menuProps}
        buttonsRender={buttonsRender}
        onClick={handleMainButtonClick}>
        {getDisplayScore()}
        </Dropdown.Button>
    </div>
    );
}
