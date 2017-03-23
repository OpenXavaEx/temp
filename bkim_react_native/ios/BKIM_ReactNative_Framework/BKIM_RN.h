#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface BKIM_RN : NSObject

-(void)showAbout: (UIViewController*)viewCtrl : (NSString*)productName ;

-(void)openBKIM : (UIView*)view : (NSString*)productName
                : (NSString*)imServerUrl : (NSString*)hostServerUrl
                : (NSString*)peerId : (NSString*)token ;

@end
