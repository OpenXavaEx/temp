'use strict';

import CSS from "./utils/CSS";

/** Colors from http://html-color-codes.info/color-names/ */
var colors = {
    White: "#FFFFFF", LightGray: "#D3D3D3", Silver: "#C0C0C0", DarkGray: "#A9A9A9", Gray: "#808080", DimGray: "#696969", Black: "#000000",
    Red: '#FF0000', DarkRed: "#8B0000",
    LightBlue: "#ADD8E6", Blue: '#0000FF', SlateBlue: "#6A5ACD", DarkBlue: "#00008B",
    LightYellow: "#FFFFE0", Yellow: '#FFFF00', Gold: "#FFD700",
}

/** Common styles */
var common = {
    line: {
        height: 1,
        backgroundColor: colors.Silver,
        margin: 3,
    },
    title: {
        color: colors.DimGray,
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: colors.LightGray,
        padding: 12,
    },
    noticeLabel: {
        color: colors.DarkRed,
        fontWeight: 'bold',
        fontSize: 14,
        backgroundColor: colors.LightYellow,
        padding: 12,
    },
    label: {
        color: colors.DimGray,
        fontSize: 14,
        padding: 0,
        margin: 0,
        paddingTop: 3,
        paddingLeft: 6,
        height: CSS.platform(25, null),
    },
    input: {
        fontSize: 14,
        margin: 0,
        marginLeft: 12,
        padding: 0,
        paddingBottom: 3,
        paddingLeft: 6,
        height: CSS.platform(25, null),
        borderBottomColor: CSS.platform(colors.Gray, null),
        borderStyle: CSS.platform("solid", null),
    },
    touchableInput: {
        margin: 2,
        marginLeft: 12,
        padding: 6,
        borderWidth:1,
        borderColor: colors.Gray,
    },
    buttons: {
        height: 35,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        //textAlignVertical: 'center',
        //color: colors.DarkBlue,
    }
}

/** Styles for ConfigView */
var configCss = {
    section: {
        borderColor: colors.LightGray,
        borderWidth: 1,
        padding: 12,
        margin: 6,
    },
    label: {
        color: colors.Black,
    },
}
CSS.mix(common, configCss);

/** Styles for ContactsView */
var contactsCss = {
    groupHeader: {
        backgroundColor: colors.LightGray,
        padding: 12,
        borderColor: colors.LightGray,
        borderTopColor: colors.White,
        borderWidth: 1,
        flexDirection: 'row'
    },
    groupTitle: {
        color: colors.DimGray,
        fontWeight: 'bold',
        fontSize: 14,
        flex: 1
    },
    groupTags: {
        color: colors.Black,
        fontSize: 12,
    },
    contact: {
        padding: 10,
        flexDirection: 'row',
        borderBottomColor: colors.LightGray,
        borderBottomWidth: 1
    },
    contactAvatarContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
    },
    contactAvatar: {
        borderRadius: 5,
        width: 30,
        height: 30
    },
    contactNameContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        height: 50,
    },
    contactName: {
        color: colors.Black,
        fontSize: 14,
    }
}
CSS.mix(common, contactsCss);

/** Styles for SessionsView */
var sessionsCss = {
    session: {
        padding: 10,
        flexDirection: 'row',
        borderBottomColor: colors.LightGray,
        borderBottomWidth: 1
    },
    sessionAvatarContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
    },
    sessionAvatar: {
        borderRadius: 5,
        width: 30,
        height: 30
    },
    sessionNameContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        height: 50,
    },
    sessionName: {
        color: colors.Black,
        fontSize: 14,
    }
};
CSS.mix(common, sessionsCss);

module.exports = {
    colors,
	configCss,
    contactsCss,
    sessionsCss
}
