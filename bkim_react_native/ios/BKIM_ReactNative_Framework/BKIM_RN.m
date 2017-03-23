#import "BKIM_RN.h"

@implementation BKIM_RN

-(void)showAbout: (UIViewController*)view : (NSString*)productName {
    NSLog(@"call function");
    
    
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
    
    [view presentViewController:alert animated:YES completion:nil];

}

@end
