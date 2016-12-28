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
    },
    input: {
        fontSize: 14,
        margin: 0,
        marginLeft: 12,
        padding: 0,
        paddingBottom: 3,
        paddingLeft: 6,
    },
    buttons: {
        height: 35,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        textAlignVertical: 'center',
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

module.exports = {
    colors,
	configCss
}
