import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import React, { useEffect, useState, useContext } from 'react';
import styled from '@emotion/styled';
import { ResponseContext } from '@/app/utils/Contexts';

const StyleWrapper = styled.div`
    --contexify-activeItem-bgColor: #b6b6b6;

    .contexify_item[type="danger"] div {
        color: red !important;
    }

    .contexify_itemContent:hover{
        background-color: red;
    }
`;

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MemberContextMenu({ MENU_ID, rightClickedMember }) {
    const {setResponse} = useContext(ResponseContext)

    const [memberName, setMemberName] = useState("");
    const [memberId, setMemberId] = useState("");
    const [kickClicked, setKickClicked] = useState(false);
    const [transferClicked, setTransferClicked] = useState(false);


    const handleItemClick = ({ id, event, props }) => {
        if (id === "transfer") {
            setTransferClicked(true);
        }
        else if (id === "confirmTransfer") {
            fetch(`${serverOrigin}/groups/transfer-ownership`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        groupId: rightClickedMember.groupId,
                        memberId: rightClickedMember.user_id
                    })
                }
            ).then((response) => response.json())
                .then((data) => {
                    setTransferClicked(false);
                    if (data.success) {
                        setResponse({ success: true, msg: `Transfered Ownership to ${memberName}` });
                    }
                    else {
                        setResponse(data);
                    }
                }).catch((err) => { console.log(err) });
        }

        if (id === "kick") {
            setKickClicked(true);
        }
        else if (id === "confirmKick") {
            fetch(`${serverOrigin}/groups/remove-member`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        groupId: rightClickedMember.groupId,
                        memberId: rightClickedMember.user_id
                    })
                }
            ).then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    if (data.success) {
                        setResponse({ success: true, msg: `Removed ${memberName}` });
                    }
                    else {
                        setResponse(data);
                    }
                }).catch((err) => { console.log(err) });
        }
        else {
            setKickClicked(false);
        }
    }

    useEffect(() => {
        setKickClicked(false);
        setTransferClicked(false);
    }, [memberId]);

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
                {
                    kickClicked ?
                        <Item id="confirmKick" type="danger" onClick={handleItemClick}>Kick?</Item>
                        :
                        <Item id="kick" type="danger" onClick={handleItemClick} closeOnClick={false}> Kick {memberName}</Item>
                }
                {
                    transferClicked ?
                        <Item id="confirmTransfer" type="danger" onClick={handleItemClick}>Transfer?</Item>
                        :
                        <Item id="transfer" type="danger" onClick={handleItemClick} closeOnClick={false}>Make {memberName} Owner</Item>
                }
            </Menu>
        </StyleWrapper>
    );
}

export default MemberContextMenu;