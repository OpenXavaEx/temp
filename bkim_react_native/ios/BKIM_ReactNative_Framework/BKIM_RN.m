#import "BKIM_RN.h"

#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"

@implementation BKIM_RN

-(void)showAbout: (UIViewController*)viewCtrl : (NSString*)productName {
    UIAlertController * alert = [UIAlertController
                                 alertControllerWithTitle:@"关于"
                                 message:[@"BKIM based on React-Native, for " stringByAppendingString:productName]
                                 preferredStyle:UIAlertControllerStyleAlert
                                 ];
    UIAlertAction *okAction = [
                               UIAlertAction actionWithTitle:@"OK"
                               style:UIAlertActionStyleDefault handler:nil
                               ];
    [alert addAction:okAction];
    
    [viewCtrl presentViewController:alert animated:YES completion:nil];

}

-(void)openBKIM : (UIView*)view : (NSString*)productName
                : (NSString*)imServerUrl : (NSString*)hostServerUrl
                : (NSString*)peerId : (NSString*)token {

    NSURL *jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

    NSDictionary *props = @{
                            @"productName": productName,
                            @"config": @{
                                @"imServerUrl": imServerUrl,
                                @"hostServerUrl": hostServerUrl,
                                @"peerId": peerId,
                                @"token": token
                                },
                            @"debugMode": @"true"
                            };
  
    RCTRootView *rootView = [[RCTRootView alloc]
                             initWithBundleURL: jsCodeLocation
                             moduleName: @"bkim_react_native"
                             initialProperties: props
                             launchOptions: nil];
    rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

    [view addSubview: rootView];
    rootView.frame = view.bounds;
}

@end
