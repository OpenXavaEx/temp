//
//  TestFunction.m
//  AppTestFramework
//
//  Created by wangyh on 2017/3/20.
//  Copyright © 2017年 wangyh. All rights reserved.
//

#import "TestFunction.h"

@implementation TestFunction

-(void)callFunc: (UIViewController*)view: (NSString*)title {
    NSLog(@"call function");
    
    
    UIAlertController * alert = [UIAlertController
                                 alertControllerWithTitle:title
                                 message:@"Test begining ..."
                                 preferredStyle:UIAlertControllerStyleAlert
                                 ];
    UIAlertAction *okAction = [
                               UIAlertAction actionWithTitle:@"OK"
                               style:UIAlertActionStyleDefault handler:nil
                               ];
    [alert addAction:okAction];
    
    [view presentViewController:alert animated:YES completion:nil];

}

@end
