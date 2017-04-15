//
//  BKIM_RNViewController.h
//  bkim_react_native
//
//  Created by u01 on 23/03/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface BKIM_RNViewController : UIViewController

@property(nonatomic) NSString *productName;
@property(nonatomic) BOOL isDebug;

@property(nonatomic) NSString *imServerUrl;
@property(nonatomic) NSString *hostServerUrl;
@property(nonatomic) NSString *peerId;
@property(nonatomic) NSString *token;

@property(nonatomic) NSString *talk2PeerId;

@end
