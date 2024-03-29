import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

const StyleWrapper = styled.div`
    --contexify-activeItem-bgColor: #b6b6b6;

    .contexify_item[type="danger"] div {
        color: red !important;
    }

    .contexify_itemContent:hover{
        background-color: red;
    }
`;

function ContextMenu({ MENU_ID, rightClickedMember }) {

    const [memberName, setMemberName] = useState("");
    const [memberId, setMemberId] = useState("");
    const [kickClicked, setKickClicked] = useState(false);


    const handleItemClick = ({ id, event, props }) => {
        switch (id) {
            case "copy":
                console.log(event, props)
                break;
            case "cut":
                console.log(event, props);
                break;
            case "kick":
                setKickClicked(true);
        }
    }

    useEffect(() => {
        if (!rightClickedMember) return;
        setMemberId(rightClickedMember.user_id);
        setMemberName(rightClickedMember.name);
    }, [rightClickedMember]);

    return (
        <StyleWrapper>
            <Menu id={MENU_ID}>
                <Item id="mute" onClick={handleItemClick}>Mute {memberName}</Item>
                <Item id="deafen" onClick={handleItemClick}>Deafen {memberName}</Item>
                <Item id="cut" onClick={handleItemClick}>Stop Video</Item>
                <Item id="kick" type="danger" onClick={handleItemClick} closeOnClick={false}>{kickClicked ? "Kick?" : `Kick ${memberName}`}</Item>
                {
                    /*
                    <Submenu label="Foobar">
                        <Item id="something" onClick={handleItemClick}>Do something else</Item>
                    </Submenu>
                    */
                }
            </Menu>
        </StyleWrapper>
    );
}

export default ContextMenu;