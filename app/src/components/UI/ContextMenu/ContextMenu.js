import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import React, {useEffect} from 'react';

function ContextMenu({ MENU_ID, contextInfo }) {

    const handleItemClick = ({ id, event, props }) => {
        switch (id) {
            case "copy":
                console.log(event, props)
                break;
            case "cut":
                console.log(event, props);
                break;
            //etc...
        }
    }

    return (
        <div>
            <Menu id={MENU_ID}>
                <Item id="copy" onClick={handleItemClick}>Copy</Item>
                <Item id="cut" onClick={handleItemClick}>Cut</Item>
                <Separator />
                <Item disabled>Test</Item>
                <Separator />
                <Submenu label="Foobar">
                    <Item id="reload" onClick={handleItemClick}>Reload</Item>
                    <Item id="something" onClick={handleItemClick}>Do something else</Item>
                </Submenu>
            </Menu>
        </div>
    );
}

export default ContextMenu;